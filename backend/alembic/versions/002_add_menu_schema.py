"""Add menu schema tables

Revision ID: 002_menu_schema
Revises: 001_horarios
Create Date: 2026-05-22
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "002_menu_schema"
down_revision: Union[str, None] = "001_horarios"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------------
    # 1. Independent entity tables
    # ------------------------------------------------------------------

    op.create_table(
        "categories",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("parent_id", UUID(as_uuid=True), sa.ForeignKey("categories.id"), nullable=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("subtitle", sa.String(200), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
    )

    op.create_table(
        "modifier_groups",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
    )

    op.create_table(
        "suppliers",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("contact_email", sa.String(200), nullable=True),
        sa.Column("country", sa.String(100), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
    )

    op.create_table(
        "dietary_tags",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("icon_url", sa.String(500), nullable=True),
        sa.Column("badge_color", sa.String(50), nullable=True),
        sa.Column("internal_ref_url", sa.String(500), nullable=True),
    )

    op.create_table(
        "allergens",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("icon_url", sa.String(500), nullable=True),
        sa.Column("severity", sa.String(50), nullable=True),
        sa.Column("internal_ref_url", sa.String(500), nullable=True),
    )

    # ------------------------------------------------------------------
    # 2. Dependent entity tables
    # ------------------------------------------------------------------

    op.create_table(
        "menu_items",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("category_id", UUID(as_uuid=True), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("base_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("is_available", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("is_featured", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("prep_time_minutes", sa.Integer, nullable=True),
        sa.Column("badge", sa.String(100), nullable=True),
    )

    op.create_table(
        "modifiers",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("modifier_group_id", UUID(as_uuid=True), sa.ForeignKey("modifier_groups.id"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("price_delta", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("max_quantity", sa.Integer, nullable=True),
        sa.Column("is_available", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
    )

    op.create_table(
        "ingredients",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("supplier_id", UUID(as_uuid=True), sa.ForeignKey("suppliers.id"), nullable=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("origin_country", sa.String(100), nullable=True),
        sa.Column("unit", sa.String(50), nullable=True),
        sa.Column("storage_instructions", sa.Text, nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
    )

    op.create_table(
        "menu_item_variants",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("menu_item_id", UUID(as_uuid=True), sa.ForeignKey("menu_items.id"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("sku", sa.String(100), nullable=True),
        sa.Column("price_override", sa.Numeric(10, 2), nullable=True),
        sa.Column("is_available", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
    )

    # ------------------------------------------------------------------
    # 3. Association / junction tables
    # ------------------------------------------------------------------

    op.create_table(
        "menu_item_modifier_groups",
        sa.Column("menu_item_id", UUID(as_uuid=True), sa.ForeignKey("menu_items.id"), primary_key=True),
        sa.Column("modifier_group_id", UUID(as_uuid=True), sa.ForeignKey("modifier_groups.id"), primary_key=True),
        sa.Column("min_selection", sa.Integer, nullable=False, server_default="0"),
        sa.Column("max_selection", sa.Integer, nullable=True),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
    )

    op.create_table(
        "menu_item_dietary_tags",
        sa.Column("menu_item_id", UUID(as_uuid=True), sa.ForeignKey("menu_items.id"), primary_key=True),
        sa.Column("dietary_tag_id", UUID(as_uuid=True), sa.ForeignKey("dietary_tags.id"), primary_key=True),
        sa.Column("is_auto_applied", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("calculated_from_ingredient_ids", sa.JSON, nullable=True),
    )

    op.create_table(
        "variant_modifier_groups",
        sa.Column("variant_id", UUID(as_uuid=True), sa.ForeignKey("menu_item_variants.id"), primary_key=True),
        sa.Column("modifier_group_id", UUID(as_uuid=True), sa.ForeignKey("modifier_groups.id"), primary_key=True),
        sa.Column("min_selection", sa.Integer, nullable=False, server_default="0"),
        sa.Column("max_selection", sa.Integer, nullable=True),
    )

    op.create_table(
        "variant_ingredients",
        sa.Column("variant_id", UUID(as_uuid=True), sa.ForeignKey("menu_item_variants.id"), primary_key=True),
        sa.Column("ingredient_id", UUID(as_uuid=True), sa.ForeignKey("ingredients.id"), primary_key=True),
        sa.Column("quantity", sa.String(100), nullable=True),
        sa.Column("is_main", sa.Boolean, nullable=False, server_default="false"),
    )

    op.create_table(
        "menu_item_ingredients",
        sa.Column("menu_item_id", UUID(as_uuid=True), sa.ForeignKey("menu_items.id"), primary_key=True),
        sa.Column("ingredient_id", UUID(as_uuid=True), sa.ForeignKey("ingredients.id"), primary_key=True),
        sa.Column("quantity", sa.String(100), nullable=True),
        sa.Column("is_main", sa.Boolean, nullable=False, server_default="false"),
    )

    op.create_table(
        "modifier_ingredients",
        sa.Column("modifier_id", UUID(as_uuid=True), sa.ForeignKey("modifiers.id"), primary_key=True),
        sa.Column("ingredient_id", UUID(as_uuid=True), sa.ForeignKey("ingredients.id"), primary_key=True),
        sa.Column("quantity", sa.String(100), nullable=True),
    )

    op.create_table(
        "ingredient_allergens",
        sa.Column("ingredient_id", UUID(as_uuid=True), sa.ForeignKey("ingredients.id"), primary_key=True),
        sa.Column("allergen_id", UUID(as_uuid=True), sa.ForeignKey("allergens.id"), primary_key=True),
    )


def downgrade() -> None:
    # Drop in reverse dependency order
    op.drop_table("ingredient_allergens")
    op.drop_table("modifier_ingredients")
    op.drop_table("menu_item_ingredients")
    op.drop_table("variant_ingredients")
    op.drop_table("variant_modifier_groups")
    op.drop_table("menu_item_dietary_tags")
    op.drop_table("menu_item_modifier_groups")
    op.drop_table("menu_item_variants")
    op.drop_table("ingredients")
    op.drop_table("modifiers")
    op.drop_table("menu_items")
    op.drop_table("allergens")
    op.drop_table("dietary_tags")
    op.drop_table("suppliers")
    op.drop_table("modifier_groups")
    op.drop_table("categories")
