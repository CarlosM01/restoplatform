"""Add product tags table

Revision ID: 004_product_tags
Revises: 003_product_image_gallery
Create Date: 2026-05-26
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "004_product_tags"
down_revision: Union[str, None] = "003_product_image_gallery"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "product_tags",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(100), unique=True, nullable=False),
        sa.Column("class_name", sa.String(50), nullable=False, server_default=""),
    )
    op.create_index("ix_product_tags_name", "product_tags", ["name"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_product_tags_name", "product_tags")
    op.drop_table("product_tags")
