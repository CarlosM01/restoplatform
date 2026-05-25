from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from app.core.database import get_db
from app.deps import require_encargado, require_admin
from app.models import Product, ProductCategory, Inventory, User, Role
from app.schemas import ProductOut, ProductCreate, ProductUpdate, StockUpdate, ProductCategoryOut

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def listar(
    category: str | None = None,
    db: Session = Depends(get_db),
):
    """Listado público de products activos"""
    q = select(Product).options(joinedload(Product.inventory)).where(Product.is_active == True)
    if category and category != "Todos":
        q = q.where(Product.category == category)
    return db.scalars(q).all()


@router.get("/categories", response_model=list[ProductCategoryOut])
def listar_categorias(db: Session = Depends(get_db)):
    """Returns distinct active product categories with their images"""
    cats = db.scalars(
        select(ProductCategory)
        .order_by(ProductCategory.name)
    ).all()
    return cats


@router.get("/{product_id}", response_model=ProductOut)
def obtener(product_id: int, db: Session = Depends(get_db)):
    p = db.get(Product, product_id)
    if not p:
        raise HTTPException(404, "Product no encontrado")
    return p


@router.post("", response_model=ProductOut, status_code=201)
def crear(
    data: ProductCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_encargado),
):
    p = Product(
        name=data.name,
        description=data.description,
        price=data.price,
        category=data.category,
        image=data.image,
        modifiers=data.modifiers,
        rating=data.rating,
        tag_class=data.tag_class,
        tag_label=data.tag_label,
    )
    db.add(p)
    db.flush()
    db.add(Inventory(product_id=p.id, stock=data.stock_inicial))
    db.commit()
    db.refresh(p)
    return p


@router.patch("/{product_id}", response_model=ProductOut)
def actualizar(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_encargado),
):
    p = db.get(Product, product_id)
    if not p:
        raise HTTPException(404)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return p


@router.patch("/{product_id}/stock", response_model=ProductOut)
def actualizar_stock(
    product_id: int,
    data: StockUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_encargado),
):
    p = db.get(Product, product_id)
    if not p:
        raise HTTPException(404)

    if not p.inventory:
        p.inventory = Inventory(product_id=p.id, stock=0)
    p.inventory.stock = data.stock
    if data.minimum_stock is not None:
        p.inventory.minimum_stock = data.minimum_stock
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{product_id}", status_code=204)
def eliminar(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    """Solo admin puede borrar definitivamente. Encargados desactivan."""
    p = db.get(Product, product_id)
    if not p:
        raise HTTPException(404)
    db.delete(p)
    db.commit()
