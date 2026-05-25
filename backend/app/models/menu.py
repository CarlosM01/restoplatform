"""
Menu schema models — implements docs/menu_schema.md ERD.

Entity tables:
    Category, MenuItem, MenuItemVariant, ModifierGroup, Modifier,
    Supplier, Ingredient, DietaryTag, Allergen

Association tables:
    MenuItemModifierGroup, MenuItemDietaryTag, VariantModifierGroup,
    VariantIngredient, MenuItemIngredient, ModifierIngredient,
    IngredientAllergen
"""

import uuid
from sqlalchemy import (
    String, Integer, Text, Numeric, Boolean, ForeignKey, JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
# pyrefly: ignore[missing-import]
from app.core.database import Base


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _pk() -> Mapped[uuid.UUID]:
    """UUID primary-key column."""
    return mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )


def _fk(target: str, *, nullable: bool = False) -> Mapped[uuid.UUID]:
    """UUID foreign-key column."""
    return mapped_column(
        UUID(as_uuid=True), ForeignKey(target), nullable=nullable,
    )


# ═══════════════════════════════════════════════════════════════════════════
# Entity tables
# ═══════════════════════════════════════════════════════════════════════════


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = _pk()
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True,
    )
    name: Mapped[str] = mapped_column(String(200))
    subtitle: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Self-referencing hierarchy
    parent: Mapped["Category | None"] = relationship(
        "Category", remote_side="Category.id", back_populates="children",
    )
    children: Mapped[list["Category"]] = relationship(
        "Category", back_populates="parent",
    )
    menu_items: Mapped[list["MenuItem"]] = relationship(back_populates="category")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id: Mapped[uuid.UUID] = _pk()
    category_id: Mapped[uuid.UUID] = _fk("categories.id")
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    base_price: Mapped[float] = mapped_column(Numeric(10, 2))
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    prep_time_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    badge: Mapped[str | None] = mapped_column(String(100), nullable=True)

    category: Mapped["Category"] = relationship(back_populates="menu_items")
    variants: Mapped[list["MenuItemVariant"]] = relationship(
        back_populates="menu_item", cascade="all, delete-orphan",
    )
    modifier_group_links: Mapped[list["MenuItemModifierGroup"]] = relationship(
        back_populates="menu_item", cascade="all, delete-orphan",
    )
    ingredient_links: Mapped[list["MenuItemIngredient"]] = relationship(
        back_populates="menu_item", cascade="all, delete-orphan",
    )
    dietary_tag_links: Mapped[list["MenuItemDietaryTag"]] = relationship(
        back_populates="menu_item", cascade="all, delete-orphan",
    )


class MenuItemVariant(Base):
    __tablename__ = "menu_item_variants"

    id: Mapped[uuid.UUID] = _pk()
    menu_item_id: Mapped[uuid.UUID] = _fk("menu_items.id")
    name: Mapped[str] = mapped_column(String(200))
    sku: Mapped[str | None] = mapped_column(String(100), nullable=True)
    price_override: Mapped[float | None] = mapped_column(
        Numeric(10, 2), nullable=True,
    )
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    menu_item: Mapped["MenuItem"] = relationship(back_populates="variants")
    modifier_group_links: Mapped[list["VariantModifierGroup"]] = relationship(
        back_populates="variant", cascade="all, delete-orphan",
    )
    ingredient_links: Mapped[list["VariantIngredient"]] = relationship(
        back_populates="variant", cascade="all, delete-orphan",
    )


class ModifierGroup(Base):
    __tablename__ = "modifier_groups"

    id: Mapped[uuid.UUID] = _pk()
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    modifiers: Mapped[list["Modifier"]] = relationship(
        back_populates="modifier_group", cascade="all, delete-orphan",
    )
    menu_item_links: Mapped[list["MenuItemModifierGroup"]] = relationship(
        back_populates="modifier_group",
    )
    variant_links: Mapped[list["VariantModifierGroup"]] = relationship(
        back_populates="modifier_group",
    )


class Modifier(Base):
    __tablename__ = "modifiers"

    id: Mapped[uuid.UUID] = _pk()
    modifier_group_id: Mapped[uuid.UUID] = _fk("modifier_groups.id")
    name: Mapped[str] = mapped_column(String(200))
    price_delta: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    max_quantity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    modifier_group: Mapped["ModifierGroup"] = relationship(back_populates="modifiers")
    ingredient_links: Mapped[list["ModifierIngredient"]] = relationship(
        back_populates="modifier", cascade="all, delete-orphan",
    )


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[uuid.UUID] = _pk()
    name: Mapped[str] = mapped_column(String(200))
    contact_email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    ingredients: Mapped[list["Ingredient"]] = relationship(back_populates="supplier")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id: Mapped[uuid.UUID] = _pk()
    supplier_id: Mapped[uuid.UUID | None] = _fk("suppliers.id", nullable=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    origin_country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    storage_instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    supplier: Mapped["Supplier | None"] = relationship(back_populates="ingredients")
    allergen_links: Mapped[list["IngredientAllergen"]] = relationship(
        back_populates="ingredient", cascade="all, delete-orphan",
    )
    menu_item_links: Mapped[list["MenuItemIngredient"]] = relationship(
        back_populates="ingredient",
    )
    variant_links: Mapped[list["VariantIngredient"]] = relationship(
        back_populates="ingredient",
    )
    modifier_links: Mapped[list["ModifierIngredient"]] = relationship(
        back_populates="ingredient",
    )


class DietaryTag(Base):
    __tablename__ = "dietary_tags"

    id: Mapped[uuid.UUID] = _pk()
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    badge_color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    internal_ref_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    menu_item_links: Mapped[list["MenuItemDietaryTag"]] = relationship(
        back_populates="dietary_tag",
    )


class Allergen(Base):
    __tablename__ = "allergens"

    id: Mapped[uuid.UUID] = _pk()
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    severity: Mapped[str | None] = mapped_column(String(50), nullable=True)
    internal_ref_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    ingredient_links: Mapped[list["IngredientAllergen"]] = relationship(
        back_populates="allergen",
    )


# ═══════════════════════════════════════════════════════════════════════════
# Association / junction tables
# ═══════════════════════════════════════════════════════════════════════════


class MenuItemModifierGroup(Base):
    __tablename__ = "menu_item_modifier_groups"

    menu_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("menu_items.id"), primary_key=True,
    )
    modifier_group_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("modifier_groups.id"), primary_key=True,
    )
    min_selection: Mapped[int] = mapped_column(Integer, default=0)
    max_selection: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    menu_item: Mapped["MenuItem"] = relationship(back_populates="modifier_group_links")
    modifier_group: Mapped["ModifierGroup"] = relationship(back_populates="menu_item_links")


class MenuItemDietaryTag(Base):
    __tablename__ = "menu_item_dietary_tags"

    menu_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("menu_items.id"), primary_key=True,
    )
    dietary_tag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("dietary_tags.id"), primary_key=True,
    )
    is_auto_applied: Mapped[bool] = mapped_column(Boolean, default=False)
    calculated_from_ingredient_ids: Mapped[dict | None] = mapped_column(
        JSON, nullable=True,
    )

    menu_item: Mapped["MenuItem"] = relationship(back_populates="dietary_tag_links")
    dietary_tag: Mapped["DietaryTag"] = relationship(back_populates="menu_item_links")


class VariantModifierGroup(Base):
    __tablename__ = "variant_modifier_groups"

    variant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("menu_item_variants.id"), primary_key=True,
    )
    modifier_group_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("modifier_groups.id"), primary_key=True,
    )
    min_selection: Mapped[int] = mapped_column(Integer, default=0)
    max_selection: Mapped[int | None] = mapped_column(Integer, nullable=True)

    variant: Mapped["MenuItemVariant"] = relationship(back_populates="modifier_group_links")
    modifier_group: Mapped["ModifierGroup"] = relationship(back_populates="variant_links")


class VariantIngredient(Base):
    __tablename__ = "variant_ingredients"

    variant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("menu_item_variants.id"), primary_key=True,
    )
    ingredient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ingredients.id"), primary_key=True,
    )
    quantity: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_main: Mapped[bool] = mapped_column(Boolean, default=False)

    variant: Mapped["MenuItemVariant"] = relationship(back_populates="ingredient_links")
    ingredient: Mapped["Ingredient"] = relationship(back_populates="variant_links")


class MenuItemIngredient(Base):
    __tablename__ = "menu_item_ingredients"

    menu_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("menu_items.id"), primary_key=True,
    )
    ingredient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ingredients.id"), primary_key=True,
    )
    quantity: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_main: Mapped[bool] = mapped_column(Boolean, default=False)

    menu_item: Mapped["MenuItem"] = relationship(back_populates="ingredient_links")
    ingredient: Mapped["Ingredient"] = relationship(back_populates="menu_item_links")


class ModifierIngredient(Base):
    __tablename__ = "modifier_ingredients"

    modifier_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("modifiers.id"), primary_key=True,
    )
    ingredient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ingredients.id"), primary_key=True,
    )
    quantity: Mapped[str | None] = mapped_column(String(100), nullable=True)

    modifier: Mapped["Modifier"] = relationship(back_populates="ingredient_links")
    ingredient: Mapped["Ingredient"] = relationship(back_populates="modifier_links")


class IngredientAllergen(Base):
    __tablename__ = "ingredient_allergens"

    ingredient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ingredients.id"), primary_key=True,
    )
    allergen_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("allergens.id"), primary_key=True,
    )

    ingredient: Mapped["Ingredient"] = relationship(back_populates="allergen_links")
    allergen: Mapped["Allergen"] = relationship(back_populates="ingredient_links")
