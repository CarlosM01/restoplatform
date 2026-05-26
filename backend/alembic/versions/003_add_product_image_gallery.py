"""Add product image gallery table

Revision ID: 003_product_image_gallery
Revises: 002_menu_schema
Create Date: 2026-05-26
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "003_product_image_gallery"
down_revision: Union[str, None] = "002_menu_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "product_image_gallery",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("url", sa.String(500), nullable=False),
        sa.Column("alt_text", sa.String(200), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index("ix_product_image_gallery_product_id", "product_image_gallery", ["product_id"])


def downgrade() -> None:
    op.drop_index("ix_product_image_gallery_product_id", "product_image_gallery")
    op.drop_table("product_image_gallery")
