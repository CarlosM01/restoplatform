from fastapi import APIRouter, Depends, HTTPException, Form
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.deps import require_cliente, get_current_user_optional
from app.models import Order, Payment, PaymentStatus, OrderStatus, User
from app.schemas import PaymentInit

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/init/{order_id}", response_model=PaymentInit)
def iniciar_pago(
    order_id: int,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "Order no encontrado")
    if order.customer_id is not None:
        if not user or order.customer_id != user.id:
            raise HTTPException(403, "No tienes permiso para pagar este pedido")
    if order.payment and order.payment.status == PaymentStatus.PAID:
        raise HTTPException(400, "Order ya pagado")

    # Simular la creación de la transacción y marcar como pagado/confirmado de inmediato
    if order.payment:
        order.payment.status = PaymentStatus.PAID
        order.payment.amount = order.total
    else:
        payment = Payment(
            order_id=order.id,
            amount=order.total,
            status=PaymentStatus.PAID,
            transbank_token="mock_token",
            transbank_buy_order=f"OC-{order.id}-{int(order.created_at.timestamp())}",
        )
        db.add(payment)

    order.status = OrderStatus.CONFIRMED
    db.commit()

    # Redirigir directamente al frontend's payment outcome (success page)
    redirect_url = f"{settings.frontend_url}/payment/result?status=exitoso&pedido={order.id}"
    return PaymentInit(url=redirect_url, token="mock_token")


@router.post("/confirmar")
def confirmar_pago(token_ws: str = Form(...), db: Session = Depends(get_db)):
    """Webpay redirige acá con token_ws como POST (simulado)"""
    payment = db.scalar(select(Payment).where(Payment.transbank_token == token_ws))
    if not payment:
        raise HTTPException(404, "Payment no encontrado")

    payment.status = PaymentStatus.PAID
    if payment.order:
        payment.order.status = OrderStatus.CONFIRMED

    db.commit()

    # Redirigir al frontend con resultado
    return RedirectResponse(
        url=f"{settings.frontend_url}/payment/result?status=exitoso&pedido={payment.order_id}",
        status_code=303,
    )


@router.get("/status/{order_id}")
def estado_pago(
    order_id: int,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404)
    if order.customer_id is not None:
        if not user or order.customer_id != user.id:
            raise HTTPException(403, "No tienes acceso a este pedido")
    if not order.payment:
        return {"status": "sin_pago"}
    return {
        "status": order.payment.status.value,
        "amount": order.payment.amount,
        "pedido_estado": order.status.value,
    }
