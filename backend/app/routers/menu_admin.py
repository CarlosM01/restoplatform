"""
Admin CRUD router for menu-domain entities.

All endpoints live under /admin/menu and require admin authentication.
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import require_admin
from app.models import User
from app.models.menu import (
    Category, MenuItem, MenuItemVariant, ModifierGroup, Modifier,
    Supplier, Ingredient, DietaryTag, Allergen,
)
from app.schemas.menu import (
    CategoryCreate, CategoryUpdate, CategoryOut,
    MenuItemCreate, MenuItemUpdate, MenuItemOut,
    MenuItemVariantCreate, MenuItemVariantUpdate, MenuItemVariantOut,
    ModifierGroupCreate, ModifierGroupUpdate, ModifierGroupOut,
    ModifierCreate, ModifierUpdate, ModifierOut,
    SupplierCreate, SupplierUpdate, SupplierOut,
    IngredientCreate, IngredientUpdate, IngredientOut,
    DietaryTagCreate, DietaryTagUpdate, DietaryTagOut,
    AllergenCreate, AllergenUpdate, AllergenOut,
)

router = APIRouter(prefix="/admin/menu", tags=["admin-menu"])


# ---------------------------------------------------------------------------
# Generic helpers
# ---------------------------------------------------------------------------

def _list(model, db):
    return db.scalars(select(model).order_by(model.name)).all()


def _get(model, id, db):
    obj = db.get(model, id)
    if not obj:
        raise HTTPException(404, f"{model.__name__} no encontrado")
    return obj


def _create(model, schema, db):
    obj = model(**schema.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def _update(model, id, schema, db):
    obj = _get(model, id, db)
    for field, value in schema.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def _delete(model, id, db):
    obj = _get(model, id, db)
    db.delete(obj)
    db.commit()


# ═══════════════════════════════════════════════════════════════════════════
# Categories
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _list(Category, db)


@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _create(Category, data, db)


@router.get("/categories/{id}", response_model=CategoryOut)
def get_category(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _get(Category, id, db)


@router.patch("/categories/{id}", response_model=CategoryOut)
def update_category(id: uuid.UUID, data: CategoryUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _update(Category, id, data, db)


@router.delete("/categories/{id}", status_code=204)
def delete_category(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    _delete(Category, id, db)


# ═══════════════════════════════════════════════════════════════════════════
# Menu Items
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/items", response_model=list[MenuItemOut])
def list_items(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _list(MenuItem, db)


@router.post("/items", response_model=MenuItemOut, status_code=201)
def create_item(data: MenuItemCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _create(MenuItem, data, db)


@router.get("/items/{id}", response_model=MenuItemOut)
def get_item(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _get(MenuItem, id, db)


@router.patch("/items/{id}", response_model=MenuItemOut)
def update_item(id: uuid.UUID, data: MenuItemUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _update(MenuItem, id, data, db)


@router.delete("/items/{id}", status_code=204)
def delete_item(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    _delete(MenuItem, id, db)


# ═══════════════════════════════════════════════════════════════════════════
# Variants
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/variants", response_model=list[MenuItemVariantOut])
def list_variants(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _list(MenuItemVariant, db)


@router.post("/variants", response_model=MenuItemVariantOut, status_code=201)
def create_variant(data: MenuItemVariantCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _create(MenuItemVariant, data, db)


@router.get("/variants/{id}", response_model=MenuItemVariantOut)
def get_variant(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _get(MenuItemVariant, id, db)


@router.patch("/variants/{id}", response_model=MenuItemVariantOut)
def update_variant(id: uuid.UUID, data: MenuItemVariantUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _update(MenuItemVariant, id, data, db)


@router.delete("/variants/{id}", status_code=204)
def delete_variant(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    _delete(MenuItemVariant, id, db)


# ═══════════════════════════════════════════════════════════════════════════
# Modifier Groups
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/modifier-groups", response_model=list[ModifierGroupOut])
def list_modifier_groups(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _list(ModifierGroup, db)


@router.post("/modifier-groups", response_model=ModifierGroupOut, status_code=201)
def create_modifier_group(data: ModifierGroupCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _create(ModifierGroup, data, db)


@router.get("/modifier-groups/{id}", response_model=ModifierGroupOut)
def get_modifier_group(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _get(ModifierGroup, id, db)


@router.patch("/modifier-groups/{id}", response_model=ModifierGroupOut)
def update_modifier_group(id: uuid.UUID, data: ModifierGroupUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _update(ModifierGroup, id, data, db)


@router.delete("/modifier-groups/{id}", status_code=204)
def delete_modifier_group(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    _delete(ModifierGroup, id, db)


# ═══════════════════════════════════════════════════════════════════════════
# Modifiers
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/modifiers", response_model=list[ModifierOut])
def list_modifiers(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _list(Modifier, db)


@router.post("/modifiers", response_model=ModifierOut, status_code=201)
def create_modifier(data: ModifierCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _create(Modifier, data, db)


@router.get("/modifiers/{id}", response_model=ModifierOut)
def get_modifier(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _get(Modifier, id, db)


@router.patch("/modifiers/{id}", response_model=ModifierOut)
def update_modifier(id: uuid.UUID, data: ModifierUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _update(Modifier, id, data, db)


@router.delete("/modifiers/{id}", status_code=204)
def delete_modifier(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    _delete(Modifier, id, db)


# ═══════════════════════════════════════════════════════════════════════════
# Suppliers
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/suppliers", response_model=list[SupplierOut])
def list_suppliers(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _list(Supplier, db)


@router.post("/suppliers", response_model=SupplierOut, status_code=201)
def create_supplier(data: SupplierCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _create(Supplier, data, db)


@router.get("/suppliers/{id}", response_model=SupplierOut)
def get_supplier(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _get(Supplier, id, db)


@router.patch("/suppliers/{id}", response_model=SupplierOut)
def update_supplier(id: uuid.UUID, data: SupplierUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _update(Supplier, id, data, db)


@router.delete("/suppliers/{id}", status_code=204)
def delete_supplier(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    _delete(Supplier, id, db)


# ═══════════════════════════════════════════════════════════════════════════
# Ingredients
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/ingredients", response_model=list[IngredientOut])
def list_ingredients(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _list(Ingredient, db)


@router.post("/ingredients", response_model=IngredientOut, status_code=201)
def create_ingredient(data: IngredientCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _create(Ingredient, data, db)


@router.get("/ingredients/{id}", response_model=IngredientOut)
def get_ingredient(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _get(Ingredient, id, db)


@router.patch("/ingredients/{id}", response_model=IngredientOut)
def update_ingredient(id: uuid.UUID, data: IngredientUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _update(Ingredient, id, data, db)


@router.delete("/ingredients/{id}", status_code=204)
def delete_ingredient(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    _delete(Ingredient, id, db)


# ═══════════════════════════════════════════════════════════════════════════
# Dietary Tags
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/dietary-tags", response_model=list[DietaryTagOut])
def list_dietary_tags(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _list(DietaryTag, db)


@router.post("/dietary-tags", response_model=DietaryTagOut, status_code=201)
def create_dietary_tag(data: DietaryTagCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _create(DietaryTag, data, db)


@router.get("/dietary-tags/{id}", response_model=DietaryTagOut)
def get_dietary_tag(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _get(DietaryTag, id, db)


@router.patch("/dietary-tags/{id}", response_model=DietaryTagOut)
def update_dietary_tag(id: uuid.UUID, data: DietaryTagUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _update(DietaryTag, id, data, db)


@router.delete("/dietary-tags/{id}", status_code=204)
def delete_dietary_tag(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    _delete(DietaryTag, id, db)


# ═══════════════════════════════════════════════════════════════════════════
# Allergens
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/allergens", response_model=list[AllergenOut])
def list_allergens(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _list(Allergen, db)


@router.post("/allergens", response_model=AllergenOut, status_code=201)
def create_allergen(data: AllergenCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _create(Allergen, data, db)


@router.get("/allergens/{id}", response_model=AllergenOut)
def get_allergen(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _get(Allergen, id, db)


@router.patch("/allergens/{id}", response_model=AllergenOut)
def update_allergen(id: uuid.UUID, data: AllergenUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return _update(Allergen, id, data, db)


@router.delete("/allergens/{id}", status_code=204)
def delete_allergen(id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    _delete(Allergen, id, db)
