from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_db
from app.models import Venue
from app.schemas import VenueOut

router = APIRouter(prefix="/venues", tags=["venues"])


@router.get("/{venue_id}", response_model=VenueOut)
def obtener_sede(venue_id: int, db: Session = Depends(get_db)):
    """Public endpoint — returns venue configuration including time slots"""
    venue = db.scalar(select(Venue).where(Venue.id == venue_id, Venue.is_active == True))
    if not venue:
        raise HTTPException(404, "Venue no encontrada")
    return venue


@router.get("", response_model=list[VenueOut])
def listar_sedes(db: Session = Depends(get_db)):
    """Public endpoint — returns all active sedes"""
    return db.scalars(select(Venue).where(Venue.is_active == True)).all()
