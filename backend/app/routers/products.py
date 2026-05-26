from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from app.core.database import get_db
from app.deps import require_encargado, require_admin
from app.models import Product, ProductCategory, Inventory, User, Role, ProductAllergen, ProductSize, ProductExtra, ProductImageGallery
from app.schemas import ProductOut, ProductCreate, ProductUpdate, StockUpdate, ProductCategoryOut
from app.schemas import ProductImageGalleryOut, ProductImageBulkSet

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def listar(
    category: str | None = None,
    db: Session = Depends(get_db),
):
    """Listado público de products activos"""
    q = select(Product).options(
        joinedload(Product.inventory),
        joinedload(Product.allergens),
        joinedload(Product.sizes),
        joinedload(Product.extras),
        joinedload(Product.gallery),
    ).where(Product.is_active == True)
    if category and category != "Todos":
        q = q.where(Product.category == category)
    return db.scalars(q).unique().all()


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
        ingredients=data.ingredients or [],
    )
    db.add(p)
    db.flush()
    
    db.add(Inventory(product_id=p.id, stock=data.stock_inicial, minimum_stock=data.minimum_stock))

    # Add size variants if specified
    if data.sizes:
        for s in data.sizes:
            db.add(ProductSize(
                product_id=p.id,
                name=s.get("name"),
                price_delta=float(s.get("price_delta", 0.0))
            ))

    # Add extras if specified
    if data.extras:
        for e in data.extras:
            db.add(ProductExtra(
                product_id=p.id,
                name=e.get("name"),
                price=float(e.get("price", 0.0))
            ))

    # Add allergens if specified
    if data.allergens:
        for a in data.allergens:
            db.add(ProductAllergen(
                product_id=p.id,
                name=a.get("name"),
                severity=a.get("severity"),
                icon=a.get("icon", "⚠️"),
                label=a.get("label", a.get("name", "").upper())
            ))

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

    relational_fields = {"sizes", "extras", "allergens", "minimum_stock"}

    # Update inventory minimum stock if it is passed
    if data.minimum_stock is not None:
        if not p.inventory:
            p.inventory = Inventory(product_id=p.id, stock=0)
        p.inventory.minimum_stock = data.minimum_stock

    for field, value in data.model_dump(exclude_unset=True).items():
        if field not in relational_fields:
            setattr(p, field, value)

    # Sync size variants
    if data.sizes is not None:
        # Clear existing ones
        db.query(ProductSize).filter(ProductSize.product_id == p.id).delete()
        for s in data.sizes:
            db.add(ProductSize(
                product_id=p.id,
                name=s.get("name"),
                price_delta=float(s.get("price_delta", 0.0))
            ))

    # Sync extras
    if data.extras is not None:
        # Clear existing ones
        db.query(ProductExtra).filter(ProductExtra.product_id == p.id).delete()
        for e in data.extras:
            db.add(ProductExtra(
                product_id=p.id,
                name=e.get("name"),
                price=float(e.get("price", 0.0))
            ))

    # Sync allergens
    if data.allergens is not None:
        # Clear existing ones
        db.query(ProductAllergen).filter(ProductAllergen.product_id == p.id).delete()
        for a in data.allergens:
            db.add(ProductAllergen(
                product_id=p.id,
                name=a.get("name"),
                severity=a.get("severity"),
                icon=a.get("icon", "⚠️"),
                label=a.get("label", a.get("name", "").upper())
            ))

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


# ═══════════════════════════════════════════════════════════════════════════
# Product Image Gallery
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/{product_id}/gallery", response_model=list[ProductImageGalleryOut])
def get_gallery(
    product_id: int,
    db: Session = Depends(get_db),
):
    """Returns the ordered gallery images for a product."""
    p = db.get(Product, product_id)
    if not p:
        raise HTTPException(404, "Product no encontrado")
    return p.gallery


@router.put("/{product_id}/gallery", response_model=list[ProductImageGalleryOut])
def set_gallery(
    product_id: int,
    data: ProductImageBulkSet,
    db: Session = Depends(get_db),
    user: User = Depends(require_encargado),
):
    """Bulk-replace the gallery for a product. Clears existing images and writes the new ordered list."""
    p = db.get(Product, product_id)
    if not p:
        raise HTTPException(404, "Product no encontrado")

    # Clear existing gallery
    db.query(ProductImageGallery).filter(ProductImageGallery.product_id == product_id).delete()

    # Insert new gallery items
    for idx, item in enumerate(data.images):
        db.add(ProductImageGallery(
            product_id=product_id,
            url=item.url,
            alt_text=item.alt_text,
            sort_order=item.sort_order if item.sort_order != 0 else idx,
        ))

    # Also update the primary image to match first gallery item (backwards-compat)
    if data.images:
        p.image = data.images[0].url

    db.commit()
    db.refresh(p)
    return p.gallery
