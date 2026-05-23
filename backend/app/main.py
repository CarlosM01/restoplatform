from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine
from app.models import Base
from app.routers import auth, products, orders, reservations, payments, admin, venues, menu_admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear tablas si no existen al iniciar la aplicación
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="RestoPlatform API",
    version="0.1.0",
    description="Backend para plataforma digital de restaurantes PYME",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:4321", "http://127.0.0.1:4321"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(reservations.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(venues.router)
app.include_router(menu_admin.router)


@app.get("/", tags=["root"])
def root():
    return {
        "app": "RestoPlatform API",
        "version": "0.1.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["root"])
def health():
    return {"status": "ok"}
