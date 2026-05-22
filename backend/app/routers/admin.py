from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import hash_password
from app.deps import require_admin
from app.models import User, Venue, Table, Role
from app.schemas import (
    UserOut, UserAdminCreate, UserUpdate,
    VenueCreate, VenueOut, TableCreate, TableOut,
)

router = APIRouter(prefix="/admin", tags=["admin"])


# ============ USUARIOS ============
@router.get("/users", response_model=list[UserOut])
def listar_usuarios(
    role: Role | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = select(User)
    if role:
        q = q.where(User.role == role)
    return db.scalars(q.order_by(User.created_at.desc())).all()


@router.post("/users", response_model=UserOut, status_code=201)
def crear_usuario(
    data: UserAdminCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if db.scalar(select(User).where(User.email == data.email)):
        raise HTTPException(400, "Email ya registrado")
    if db.scalar(select(User).where(User.rut == data.rut)):
        raise HTTPException(400, "RUT ya registrado")

    if data.role == Role.MANAGER and not data.venue_id:
        raise HTTPException(400, "Encargado debe tener venue_id asignada")

    user = User(
        rut=data.rut,
        email=data.email,
        name=data.name,
        password_hash=hash_password(data.password),
        role=data.role,
        venue_id=data.venue_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}", response_model=UserOut)
def actualizar_usuario(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404)
    if user.id == admin.id and data.is_banned:
        raise HTTPException(400, "No puedes banearte a ti mismo")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def eliminar_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(400, "No puedes eliminarte a ti mismo")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404)
    db.delete(user)
    db.commit()


@router.patch("/users/{user_id}/ban")
def banear(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(400, "No puedes banearte a ti mismo")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404)
    user.is_banned = True
    db.commit()
    return {"ok": True}


@router.patch("/users/{user_id}/unban")
def desbanear(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404)
    user.is_banned = False
    db.commit()
    return {"ok": True}


# ============ SEDES ============
@router.get("/sedes", response_model=list[VenueOut])
def listar_sedes(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.scalars(select(Venue)).all()


@router.post("/sedes", response_model=VenueOut, status_code=201)
def crear_sede(
    data: VenueCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    s = Venue(**data.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


# ============ MESAS ============
@router.post("/tables", response_model=TableOut, status_code=201)
def crear_mesa(
    data: TableCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    m = Table(**data.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.get("/tables", response_model=list[TableOut])
def listar_mesas(
    venue_id: int | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = select(Table)
    if venue_id:
        q = q.where(Table.venue_id == venue_id)
    return db.scalars(q).all()
