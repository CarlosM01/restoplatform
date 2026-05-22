from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from app.core.database import get_db
from app.deps import require_cliente, require_encargado
from app.models import Reservation, Table, User, Role
from app.schemas import ReservationCreate, ReservationOut, TableOut

router = APIRouter(prefix="/reservations", tags=["reservations"])


@router.get("/tables/{venue_id}", response_model=list[TableOut])
def listar_mesas(venue_id: int, db: Session = Depends(get_db)):
    """Listado público de tables activas de una venue"""
    return db.scalars(
        select(Table).where(Table.venue_id == venue_id, Table.is_active == True)
    ).all()


@router.get("/availability/{venue_id}")
def disponibilidad(
    venue_id: int,
    date: datetime,
    db: Session = Depends(get_db),
):
    """Devuelve qué tables están ocupadas en un horario (±90 min)"""
    inicio = date - timedelta(minutes=90)
    fin = date + timedelta(minutes=90)

    ocupadas = db.scalars(
        select(Reservation.table_id).where(
            and_(
                Reservation.venue_id == venue_id,
                Reservation.status == "confirmada",
                Reservation.date >= inicio,
                Reservation.date <= fin,
            )
        )
    ).all()
    return {"mesas_ocupadas": list(ocupadas)}


@router.post("", response_model=ReservationOut, status_code=201)
def crear_reserva(
    data: ReservationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_cliente),
):
    mesa = db.get(Table, data.table_id)
    if not mesa or not mesa.is_active:
        raise HTTPException(400, "Table no disponible")

    # Verificar que la mesa esté libre en ese horario
    inicio = data.date - timedelta(minutes=90)
    fin = data.date + timedelta(minutes=90)
    ocupada = db.scalar(
        select(Reservation).where(
            and_(
                Reservation.table_id == data.table_id,
                Reservation.status == "confirmada",
                Reservation.date >= inicio,
                Reservation.date <= fin,
            )
        )
    )
    if ocupada:
        raise HTTPException(409, "Table ya reservada en ese horario")

    r = Reservation(
        customer_id=user.id,
        table_id=data.table_id,
        venue_id=data.venue_id,
        date=data.date,
        guests_count=data.guests_count,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.get("/my", response_model=list[ReservationOut])
def mis_reservas(db: Session = Depends(get_db), user: User = Depends(require_cliente)):
    return db.scalars(
        select(Reservation)
        .where(Reservation.customer_id == user.id)
        .order_by(Reservation.date.desc())
    ).all()


@router.patch("/{reservation_id}/cancelar")
def cancelar_reserva(
    reservation_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_cliente),
):
    r = db.get(Reservation, reservation_id)
    if not r:
        raise HTTPException(404)
    if user.role == Role.CUSTOMER and r.customer_id != user.id:
        raise HTTPException(403)
    r.status = "cancelada"
    db.commit()
    return {"ok": True}
