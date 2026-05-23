"""Script de seed: crea users, sedes, tables y products iniciales.

Uso:
    python -m app.seed
"""
from sqlalchemy import select
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models import User, Venue, Table, Product, Inventory, Role


def seed():
    # Crear tablas si no existen (en desarrollo). En prod usar Alembic.
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ===== SEDES =====
        if not db.scalar(select(Venue)):
            print("Creando sedes...")
            sede1 = Venue(
                name="La Leña Temuco",
                address="Av. Alemania 456, Temuco",
                phone="+56912345678",
            )
            db.add(sede1)
            db.commit()
            db.refresh(sede1)
        else:
            sede1 = db.scalar(select(Venue))

        # ===== USUARIOS =====
        if not db.scalar(select(User).where(User.email == "admin@lalena.cl")):
            print("Creando users...")
            admin = User(
                rut="11111111-1",
                email="admin@lalena.cl",
                name="Admin Dueño",
                password_hash=hash_password("admin123"),
                role=Role.ADMIN,
            )
            encargado = User(
                rut="22222222-2",
                email="encargado@lalena.cl",
                name="Carlos Encargado",
                password_hash=hash_password("encargado123"),
                role=Role.MANAGER,
                venue_id=sede1.id,
            )
            customer = User(
                rut="33333333-3",
                email="customer@test.cl",
                name="Juan Cliente",
                password_hash=hash_password("cliente123"),
                role=Role.CUSTOMER,
            )
            db.add_all([admin, encargado, customer])
            db.commit()

        # ===== MESAS =====
        if not db.scalar(select(Table)):
            print("Creando tables...")
            for i in range(1, 16):
                cap = 2 if i <= 5 else (4 if i <= 10 else 6)
                db.add(Table(number=i, venue_id=sede1.id, capacity=cap))
            db.commit()

        # ===== PRODUCTOS =====
        if not db.scalar(select(Product)):
            print("Creando products...")
            productos_data = [
                ("Lomo a lo Pobre", "Lomo vetado, huevos fritos, papas y cebolla", 8990, "Carne", "🥩", 20),
                ("Pollo Arvejado", "Trutro de pollo con arvejas y arroz", 6990, "Pollo", "🍗", 25),
                ("Cazuela de Vacuno", "Caldo con zapallo, choclo, papa y carne", 5990, "Carne", "🍲", 15),
                ("Ensalada César", "Lechuga, crutones, parmesano y aderezo", 4990, "Ensalada", "🥗", 30),
                ("Pastel de Choclo", "Pino, pollo, huevo duro y pasta de choclo", 7490, "Carne", "🫕", 18),
                ("Empanadas de Pino", "Masa horneada rellena de pino tradicional", 2490, "Entrada", "🥟", 50),
                ("Congrio Frito", "Congrio dorado con ensalada y papas mayo", 9990, "Pescado", "🐟", 12),
                ("Humitas", "Pasta de choclo envuelta en hojas", 3990, "Entrada", "🌽", 25),
            ]
            for name, desc, price, cat, img, stock in productos_data:
                p = Product(
                    name=name,
                    description=desc,
                    price=price,
                    category=cat,
                    image=img,
                    venue_id=sede1.id,
                )
                db.add(p)
                db.flush()
                db.add(Inventory(product_id=p.id, stock=stock, minimum_stock=5))
            db.commit()

        print("\n✓ Seed completado")
        print("\nUsuarios de prueba:")
        print("  Admin:     admin@lalena.cl / admin123")
        print("  Encargado: encargado@lalena.cl / encargado123")
        print("  Cliente:   customer@test.cl / cliente123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
