from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from app.core.database import get_db
from app.deps import require_cliente, require_encargado
from app.models import Order, OrderItem, Product, OrderStatus, User, Role
from app.schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
def crear_pedido(
    data: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_cliente),
):
    if not data.items:
        raise HTTPException(400, "El order debe tener al menos un ítem")

    # Validar stock y calcular total en una sola transacción
    total = 0.0
    items_data: list[tuple[Product, int]] = []

    for item in data.items:
        # SELECT FOR UPDATE para evitar race conditions
        product = db.execute(
            select(Product)
            .options(joinedload(Product.inventory))
            .where(Product.id == item.product_id)
            .with_for_update(of=Product)
        ).scalar_one_or_none()

        if not product or not product.is_active:
            raise HTTPException(400, f"Product {item.product_id} no disponible")
        if not product.inventory:
            raise HTTPException(400, f"Product {product.name} sin inventory")
        if product.inventory.stock < item.quantity:
            raise HTTPException(
                400,
                f"Stock insuficiente para {product.name} (disponible: {product.inventory.stock})"
            )

        items_data.append((product, item.quantity))
        total += product.price * item.quantity

    order = Order(
        customer_id=user.id,
        total=total,
        status=OrderStatus.PENDING,
    )
    db.add(order)
    db.flush()

    for product, quantity in items_data:
        db.add(OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=product.price,
        ))
        product.inventory.stock -= quantity

    db.commit()
    db.refresh(order)
    return order


@router.get("/my", response_model=list[OrderOut])
def mis_pedidos(
    db: Session = Depends(get_db),
    user: User = Depends(require_cliente),
):
    return db.scalars(
        select(Order)
        .where(Order.customer_id == user.id)
        .order_by(Order.created_at.desc())
    ).all()


@router.get("/venue", response_model=list[OrderOut])
def pedidos_sede(
    status: OrderStatus | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_encargado),
):
    """Encargado ve orders de su venue (ahora todos). Admin ve todos."""
    q = select(Order).order_by(Order.created_at.desc())
    if status:
        q = q.where(Order.status == status)
    return db.scalars(q).all()


@router.get("/{order_id}", response_model=OrderOut)
def obtener(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_cliente),
):
    p = db.get(Order, order_id)
    if not p:
        raise HTTPException(404)
    if user.role == Role.CUSTOMER and p.customer_id != user.id:
        raise HTTPException(403, "No puedes ver orders de otros clientes")
    return p


@router.patch("/{order_id}/confirmar")
def confirmar(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_encargado),
):
    p = db.get(Order, order_id)
    if not p:
        raise HTTPException(404)
    if p.status in (OrderStatus.CANCELED, OrderStatus.DELIVERED):
        raise HTTPException(400, f"Order en status {p.status.value} no se puede confirmar")
    p.status = OrderStatus.CONFIRMED
    db.commit()
    return {"ok": True, "status": p.status.value}


@router.patch("/{order_id}/preparar")
def preparar(order_id: int, db: Session = Depends(get_db), user: User = Depends(require_encargado)):
    p = db.get(Order, order_id)
    if not p: raise HTTPException(404)
    p.status = OrderStatus.IN_PREPARATION
    db.commit()
    return {"ok": True}


@router.patch("/{order_id}/listo")
def listo(order_id: int, db: Session = Depends(get_db), user: User = Depends(require_encargado)):
    p = db.get(Order, order_id)
    if not p: raise HTTPException(404)
    p.status = OrderStatus.READY
    db.commit()
    return {"ok": True}


@router.patch("/{order_id}/entregar")
def entregar(order_id: int, db: Session = Depends(get_db), user: User = Depends(require_encargado)):
    p = db.get(Order, order_id)
    if not p: raise HTTPException(404)
    p.status = OrderStatus.DELIVERED
    db.commit()
    return {"ok": True}


@router.patch("/{order_id}/cancelar")
def cancelar(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_encargado),
):
    p = db.get(Order, order_id)
    if not p: raise HTTPException(404)
    if p.status == OrderStatus.CANCELED:
        raise HTTPException(400, "Ya está cancelado")

    # Devolver stock
    for item in p.items:
        if item.product and item.product.inventory:
            item.product.inventory.stock += item.quantity

    p.status = OrderStatus.CANCELED
    db.commit()
    return {"ok": True}
