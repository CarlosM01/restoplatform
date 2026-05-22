from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, hash_password
from app.models import User, Role
from app.schemas import UserCreate, Token, UserOut
from app.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def registro(data: UserCreate, db: Session = Depends(get_db)):
    """Registro público (solo crea clientes)"""
    if db.scalar(select(User).where(User.email == data.email)):
        raise HTTPException(400, "Email ya registrado")
    if db.scalar(select(User).where(User.rut == data.rut)):
        raise HTTPException(400, "RUT ya registrado")

    user = User(
        rut=data.rut,
        email=data.email,
        name=data.name,
        password_hash=hash_password(data.password),
        role=Role.CUSTOMER,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == form.username))
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(401, "Credenciales inválidas")
    if user.is_banned:
        raise HTTPException(403, "Cuenta baneada")
    if not user.is_active:
        raise HTTPException(403, "Cuenta inactiva")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return Token(
        access_token=token,
        role=user.role.value,
        user_id=user.id,
        name=user.name,
    )


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
