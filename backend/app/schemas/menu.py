"""
Pydantic schemas for the menu domain (docs/menu_schema.md).
"""

from __future__ import annotations

import uuid
from pydantic import BaseModel, ConfigDict, Field


# ═══════════════════════════════════════════════════════════════════════════
# Category
# ═══════════════════════════════════════════════════════════════════════════

class CategoryCreate(BaseModel):
    parent_id: uuid.UUID | None = None
    name: str = Field(..., min_length=1, max_length=200)
    subtitle: str | None = None
    description: str | None = None
    image_url: str | None = None
    sort_order: int = 0
    is_active: bool = True


class CategoryUpdate(BaseModel):
    parent_id: uuid.UUID | None = None
    name: str | None = None
    subtitle: str | None = None
    description: str | None = None
    image_url: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class CategoryOut(BaseModel):
    id: uuid.UUID
    parent_id: uuid.UUID | None
    name: str
    subtitle: str | None
    description: str | None
    image_url: str | None
    sort_order: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


# ═══════════════════════════════════════════════════════════════════════════
# MenuItem
# ═══════════════════════════════════════════════════════════════════════════

class MenuItemCreate(BaseModel):
    category_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    base_price: float = Field(..., gt=0)
    image_url: str | None = None
    is_available: bool = True
    is_featured: bool = False
    sort_order: int = 0
    prep_time_minutes: int | None = None
    badge: str | None = None


class MenuItemUpdate(BaseModel):
    category_id: uuid.UUID | None = None
    name: str | None = None
    description: str | None = None
    base_price: float | None = None
    image_url: str | None = None
    is_available: bool | None = None
    is_featured: bool | None = None
    sort_order: int | None = None
    prep_time_minutes: int | None = None
    badge: str | None = None


class MenuItemOut(BaseModel):
    id: uuid.UUID
    category_id: uuid.UUID
    name: str
    description: str | None
    base_price: float
    image_url: str | None
    is_available: bool
    is_featured: bool
    sort_order: int
    prep_time_minutes: int | None
    badge: str | None
    model_config = ConfigDict(from_attributes=True)


# ═══════════════════════════════════════════════════════════════════════════
# MenuItemVariant
# ═══════════════════════════════════════════════════════════════════════════

class MenuItemVariantCreate(BaseModel):
    menu_item_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=200)
    sku: str | None = None
    price_override: float | None = None
    is_available: bool = True
    sort_order: int = 0


class MenuItemVariantUpdate(BaseModel):
    menu_item_id: uuid.UUID | None = None
    name: str | None = None
    sku: str | None = None
    price_override: float | None = None
    is_available: bool | None = None
    sort_order: int | None = None


class MenuItemVariantOut(BaseModel):
    id: uuid.UUID
    menu_item_id: uuid.UUID
    name: str
    sku: str | None
    price_override: float | None
    is_available: bool
    sort_order: int
    model_config = ConfigDict(from_attributes=True)


# ═══════════════════════════════════════════════════════════════════════════
# ModifierGroup
# ═══════════════════════════════════════════════════════════════════════════

class ModifierGroupCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    sort_order: int = 0


class ModifierGroupUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    sort_order: int | None = None


class ModifierGroupOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    sort_order: int
    model_config = ConfigDict(from_attributes=True)


# ═══════════════════════════════════════════════════════════════════════════
# Modifier
# ═══════════════════════════════════════════════════════════════════════════

class ModifierCreate(BaseModel):
    modifier_group_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=200)
    price_delta: float = 0
    max_quantity: int | None = None
    is_available: bool = True
    sort_order: int = 0


class ModifierUpdate(BaseModel):
    modifier_group_id: uuid.UUID | None = None
    name: str | None = None
    price_delta: float | None = None
    max_quantity: int | None = None
    is_available: bool | None = None
    sort_order: int | None = None


class ModifierOut(BaseModel):
    id: uuid.UUID
    modifier_group_id: uuid.UUID
    name: str
    price_delta: float
    max_quantity: int | None
    is_available: bool
    sort_order: int
    model_config = ConfigDict(from_attributes=True)


# ═══════════════════════════════════════════════════════════════════════════
# Supplier
# ═══════════════════════════════════════════════════════════════════════════

class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    contact_email: str | None = None
    country: str | None = None
    is_active: bool = True


class SupplierUpdate(BaseModel):
    name: str | None = None
    contact_email: str | None = None
    country: str | None = None
    is_active: bool | None = None


class SupplierOut(BaseModel):
    id: uuid.UUID
    name: str
    contact_email: str | None
    country: str | None
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


# ═══════════════════════════════════════════════════════════════════════════
# Ingredient
# ═══════════════════════════════════════════════════════════════════════════

class IngredientCreate(BaseModel):
    supplier_id: uuid.UUID | None = None
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    image_url: str | None = None
    origin_country: str | None = None
    unit: str | None = None
    storage_instructions: str | None = None
    is_active: bool = True


class IngredientUpdate(BaseModel):
    supplier_id: uuid.UUID | None = None
    name: str | None = None
    description: str | None = None
    image_url: str | None = None
    origin_country: str | None = None
    unit: str | None = None
    storage_instructions: str | None = None
    is_active: bool | None = None


class IngredientOut(BaseModel):
    id: uuid.UUID
    supplier_id: uuid.UUID | None
    name: str
    description: str | None
    image_url: str | None
    origin_country: str | None
    unit: str | None
    storage_instructions: str | None
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


# ═══════════════════════════════════════════════════════════════════════════
# DietaryTag
# ═══════════════════════════════════════════════════════════════════════════

class DietaryTagCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    icon_url: str | None = None
    badge_color: str | None = None
    internal_ref_url: str | None = None


class DietaryTagUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    icon_url: str | None = None
    badge_color: str | None = None
    internal_ref_url: str | None = None


class DietaryTagOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    icon_url: str | None
    badge_color: str | None
    internal_ref_url: str | None
    model_config = ConfigDict(from_attributes=True)


# ═══════════════════════════════════════════════════════════════════════════
# Allergen
# ═══════════════════════════════════════════════════════════════════════════

class AllergenCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    icon_url: str | None = None
    severity: str | None = None
    internal_ref_url: str | None = None


class AllergenUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    icon_url: str | None = None
    severity: str | None = None
    internal_ref_url: str | None = None


class AllergenOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    icon_url: str | None
    severity: str | None
    internal_ref_url: str | None
    model_config = ConfigDict(from_attributes=True)
