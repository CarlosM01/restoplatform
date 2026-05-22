"""Add horarios_reserva to sedes

Revision ID: 001_horarios
Revises:
Create Date: 2026-05-22
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import json

revision: str = "001_horarios"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFAULT_HORARIOS = [
    "12:00", "12:30", "13:00", "13:30", "14:00",
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00",
]


def upgrade() -> None:
    op.add_column(
        "sedes",
        sa.Column("horarios_reserva", sa.JSON(), nullable=True),
    )
    # Populate existing rows with default time slots
    conn = op.get_bind()
    conn.execute(
        sa.text("UPDATE sedes SET horarios_reserva = :h"),
        {"h": json.dumps(DEFAULT_HORARIOS)},
    )


def downgrade() -> None:
    op.drop_column("sedes", "horarios_reserva")
