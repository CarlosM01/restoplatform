"""Script de seed: crea usuarios, mesas, productos legacy y la estructura completa de menú.

Uso:
    python -m app.seed
"""
import uuid
from sqlalchemy import select
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models import (
    User, Table, Product, ProductCategory, Inventory, Role, ProductTag,
    Category, MenuItem, MenuItemVariant, ModifierGroup, Modifier,
    Supplier, Ingredient, DietaryTag, Allergen,
    MenuItemModifierGroup, MenuItemDietaryTag, VariantModifierGroup,
    VariantIngredient, MenuItemIngredient, ModifierIngredient,
    IngredientAllergen, ProductAllergen, ProductSize, ProductExtra,
)


def seed():
    # Recrear tablas para desarrollo
    print("Limpiando base de datos...")
    Base.metadata.drop_all(bind=engine)
    print("Creando tablas...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ===== USUARIOS =====
        if not db.scalar(select(User).where(User.email == "admin@restoapp.cl")):
            print("Creando usuarios...")
            admin = User(
                rut="11111111-1",
                email="admin@restoapp.cl",
                name="Admin Dueño",
                password_hash=hash_password("admin123"),
                role=Role.ADMIN,
            )
            encargado = User(
                rut="22222222-2",
                email="encargado@restoapp.cl",
                name="Carlos Encargado",
                password_hash=hash_password("encargado123"),
                role=Role.MANAGER,
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
            print("Creando mesas...")
            for i in range(1, 16):
                cap = 2 if i <= 5 else (4 if i <= 10 else 6)
                db.add(Table(number=i, capacity=cap))
            db.commit()

        # ===== PRODUCT TAGS =====
        if not db.scalar(select(ProductTag)):
            print("Creando etiquetas de productos...")
            tag_data = [
                ("🔥 Popular", "#FF9F43"),
                ("👨‍🍳 Chef's choice", "#1B1916"),
                ("🌱 Vegano", "#2ECC71"),
            ]
            for name, color in tag_data:
                db.add(ProductTag(name=name, color=color))
            db.commit()

        # ===== PRODUCT CATEGORIES =====
        if not db.scalar(select(ProductCategory)):
            print("Creando categorías de productos...")
            cat_data = [
                ("Carne", "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=100&auto=format&fit=crop&q=60"),
                ("Pollo", "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=100&auto=format&fit=crop&q=60"),
                ("Ensalada", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&auto=format&fit=crop&q=60"),
                ("Entrada", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&auto=format&fit=crop&q=60"),
                ("Pescado", "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=100&auto=format&fit=crop&q=60"),
                ("Pizza", "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&auto=format&fit=crop&q=60"),
            ]
            for name, img in cat_data:
                db.add(ProductCategory(name=name, image=img))
            db.commit()

        # ===== PRODUCTOS (LEGACY/Venta) =====
        if not db.scalar(select(Product)):
            print("Creando productos legacy...")
            productos_data = [
                ("Lomo a lo Pobre", "Lomo vetado, huevos fritos, papas y cebolla", 8990, "Carne", "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&auto=format&fit=crop&q=60", 20, 4.8, "#FF9F43", "🔥 Popular"),
                ("Pollo Arvejado", "Trutro de pollo con arvejas y arroz", 6990, "Pollo", "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=60", 25, 4.5, None, None),
                ("Cazuela de Vacuno", "Caldo con zapallo, choclo, papa y carne", 5990, "Carne", "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=60", 15, 4.6, None, None),
                ("Ensalada César", "Lechuga, crutones, parmesano y aderezo", 4990, "Ensalada", "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=60", 30, 4.3, None, None),
                ("Pastel de Choclo", "Pino, pollo, huevo duro y pasta de choclo", 7490, "Carne", "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60", 18, 4.5, "#1B1916", "👨‍🍳 Chef's choice"),
                ("Empanadas de Pino", "Masa horneada rellena de pino tradicional", 2490, "Entrada", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=60", 50, 4.5, "#FF9F43", "🔥 Popular"),
                ("Congrio Frito", "Congrio dorado con ensalada y papas mayo", 9990, "Pescado", "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=60", 12, 4.7, "#1B1916", "👨‍🍳 Chef's choice"),
                ("Humitas", "Pasta de choclo envuelta en hojas", 3990, "Entrada", "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=60", 25, 4.4, "#2ECC71", "🌱 Vegano"),
            ]

            details = {
                "Lomo a lo Pobre": {
                    "allergens": [("Huevo", "Alta"), ("Gluten", "Moderada")],
                    "sizes": [("Individual", 0.0), ("Familiar", 7000.0)],
                    "extras": [("Huevo Frito Extra", 600.0), ("Cebolla Caramelizada", 800.0), ("Papas Fritas Extra", 1500.0)]
                },
                "Pollo Arvejado": {
                    "allergens": [("Gluten", "Moderada")],
                    "sizes": [("Porción Normal", 0.0), ("Porción Gigante", 2500.0)],
                    "extras": [("Arroz Extra", 800.0), ("Papas Fritas Extra", 1500.0)]
                },
                "Cazuela de Vacuno": {
                    "allergens": [],
                    "sizes": [("Plato Mediano", 0.0), ("Plato Grande", 1200.0)],
                    "extras": [("Carne Extra", 2000.0), ("Papa Extra", 600.0), ("Choclo Extra", 500.0)]
                },
                "Ensalada César": {
                    "allergens": [("Huevo", "Alta"), ("Lácteos", "Alta"), ("Gluten", "Moderada"), ("Pescado", "Alta")],
                    "sizes": [("Acompañamiento", 0.0), ("Principal", 1800.0)],
                    "extras": [("Pollo Deshilachado", 1500.0), ("Queso Parmesano Extra", 900.0), ("Crutones Extra", 500.0)]
                },
                "Pastel de Choclo": {
                    "allergens": [("Huevo", "Alta"), ("Lácteos", "Alta")],
                    "sizes": [("Paila Chica", 0.0), ("Paila Grande", 2000.0)],
                    "extras": [("Azúcar Flor", 0.0), ("Huevo Duro Extra", 500.0)]
                },
                "Empanadas de Pino": {
                    "allergens": [("Gluten", "Moderada"), ("Huevo", "Alta")],
                    "sizes": [("Empanada Mediana", 0.0), ("Empanada XL", 1000.0)],
                    "extras": [("Pebre Cuchareado", 300.0), ("Ají Verde", 200.0)]
                },
                "Congrio Frito": {
                    "allergens": [("Pescado", "Alta"), ("Gluten", "Moderada"), ("Huevo", "Alta")],
                    "sizes": [("Normal", 0.0), ("Doble Filete", 4500.0)],
                    "extras": [("Ensalada Chilena Extra", 1200.0), ("Salsa Tártara", 500.0), ("Papas Mayo Extra", 1400.0)]
                },
                "Humitas": {
                    "allergens": [("Lácteos", "Alta")],
                    "sizes": [("1 Humita", 0.0), ("2 Humitas", 3000.0)],
                    "extras": [("Ensalada Chilena", 1500.0), ("Azúcar", 200.0)]
                }
            }

            for name, desc, price, cat, img, stock, rating, tag_class, tag_label in productos_data:
                product_ingredients = {
                    "Lomo a lo Pobre": ["Lomo Vetado", "Papas", "Cebolla", "Huevo"],
                    "Pollo Arvejado": ["Pechuga de Pollo", "Arvejas", "Zanahoria", "Arroz"],
                    "Cazuela de Vacuno": ["Carne de Vacuno", "Zapallo", "Choclo", "Papa"],
                    "Ensalada César": ["Lechuga Costina", "Crutones", "Queso Parmesano", "Aderezo César"],
                    "Pastel de Choclo": ["Choclo", "Pino de Carne", "Pollo", "Huevo Duro"],
                    "Empanadas de Pino": ["Pino de Carne", "Masa de Harina", "Huevo Duro", "Aceituna"],
                    "Congrio Frito": ["Congrio Dorado", "Batido Frito", "Papas", "Mayonesa"],
                    "Humitas": ["Choclo Molido", "Albahaca", "Cebolla", "Ensalada Chilena"]
                }.get(name, [])

                p = Product(
                    name=name,
                    description=desc,
                    price=price,
                    category=cat,
                    image=img,
                    rating=rating,
                    tag_class=tag_class,
                    tag_label=tag_label,
                    ingredients=product_ingredients,
                )
                db.add(p)
                db.flush()
                
                # Relational details
                ALLERGEN_MAP = {
                    'Huevo': {'icon': '🥚', 'label': 'EGGS'},
                    'Gluten': {'icon': '🌾', 'label': 'GLUTEN'},
                    'Lácteos': {'icon': '🥛', 'label': 'DAIRY'},
                    'Pescado': {'icon': '🐟', 'label': 'FISH'},
                    'Maní': {'icon': '🥜', 'label': 'PEANUT'},
                    'Lupino': {'icon': '🌱', 'label': 'LUPIN'},
                    'Moluscos': {'icon': '🐚', 'label': 'MOLLUSK'},
                    'Mostaza': {'icon': '🍯', 'label': 'MUSTARD'},
                }
                item_details = details.get(name, {"allergens": [], "sizes": [], "extras": []})
                for all_name, severity in item_details["allergens"]:
                    all_info = ALLERGEN_MAP.get(all_name, {'icon': '⚠️', 'label': all_name.upper()})
                    db.add(ProductAllergen(
                        product_id=p.id,
                        name=all_name,
                        severity=severity,
                        icon=all_info['icon'],
                        label=all_info['label']
                    ))
                for sz_name, price_delta in item_details["sizes"]:
                    db.add(ProductSize(product_id=p.id, name=sz_name, price_delta=price_delta))
                for ex_name, ex_price in item_details["extras"]:
                    db.add(ProductExtra(product_id=p.id, name=ex_name, price=ex_price))

                db.add(Inventory(product_id=p.id, stock=stock, minimum_stock=5))
            db.commit()

        # ===== NUEVA ESTRUCTURA DE BASE DE DATOS (MENÚ Y LOGÍSTICA) =====
        print("Poblando la nueva estructura de la base de datos...")

        # ===== PROVEEDORES =====
        print("  - Creando proveedores...")
        sup_carnes = Supplier(
            id=uuid.uuid4(),
            name="Distribuidora Central de Carnes",
            contact_email="contacto@centralcarnes.cl",
            country="Chile",
            is_active=True
        )
        sup_huerta = Supplier(
            id=uuid.uuid4(),
            name="La Huerta de Paine",
            contact_email="ventas@lahuertadepaine.cl",
            country="Chile",
            is_active=True
        )
        sup_med = Supplier(
            id=uuid.uuid4(),
            name="Importadora del Mediterráneo",
            contact_email="info@mediterraneo.cl",
            country="España",
            is_active=True
        )
        db.add_all([sup_carnes, sup_huerta, sup_med])
        db.flush()

        # ===== INGREDIENTES =====
        print("  - Creando ingredientes...")
        ing_lomo = Ingredient(
            id=uuid.uuid4(),
            supplier_id=sup_carnes.id,
            name="Lomo Vetado",
            description="Corte de lomo vetado premium",
            origin_country="Chile",
            unit="kg",
            is_active=True
        )
        ing_pollo = Ingredient(
            id=uuid.uuid4(),
            supplier_id=sup_carnes.id,
            name="Pechuga de Pollo",
            description="Pechuga deshuesada fresca",
            origin_country="Chile",
            unit="kg",
            is_active=True
        )
        ing_papas = Ingredient(
            id=uuid.uuid4(),
            supplier_id=sup_huerta.id,
            name="Papas",
            description="Papa limpia tipo astria",
            origin_country="Chile",
            unit="kg",
            is_active=True
        )
        ing_cebolla = Ingredient(
            id=uuid.uuid4(),
            supplier_id=sup_huerta.id,
            name="Cebolla",
            description="Cebolla valenciana fresca",
            origin_country="Chile",
            unit="kg",
            is_active=True
        )
        ing_huevo = Ingredient(
            id=uuid.uuid4(),
            supplier_id=sup_huerta.id,
            name="Huevo",
            description="Huevo fresco de gallina libre",
            origin_country="Chile",
            unit="unidades",
            is_active=True
        )
        ing_parmesano = Ingredient(
            id=uuid.uuid4(),
            supplier_id=sup_med.id,
            name="Queso Parmesano",
            description="Queso Parmigiano Reggiano madurado",
            origin_country="Italia",
            unit="kg",
            is_active=True
        )
        ing_lechuga = Ingredient(
            id=uuid.uuid4(),
            supplier_id=sup_huerta.id,
            name="Lechuga Costina",
            description="Lechuga costina fresca e hidropónica",
            origin_country="Chile",
            unit="unidades",
            is_active=True
        )
        db.add_all([ing_lomo, ing_pollo, ing_papas, ing_cebolla, ing_huevo, ing_parmesano, ing_lechuga])
        db.flush()

        # ===== ALÉRGENOS =====
        print("  - Creando alérgenos...")
        all_huevo = Allergen(
            id=uuid.uuid4(),
            name="Huevo",
            description="Huevo y productos derivados",
            severity="Alta"
        )
        all_lacteos = Allergen(
            id=uuid.uuid4(),
            name="Lácteos",
            description="Leche, queso y derivados lácteos",
            severity="Alta"
        )
        all_gluten = Allergen(
            id=uuid.uuid4(),
            name="Gluten",
            description="Trigo, cebada o centeno",
            severity="Moderada"
        )
        db.add_all([all_huevo, all_lacteos, all_gluten])
        db.flush()

        # ===== INGREDIENTES Y ALÉRGENOS (JUNCTION) =====
        db.add_all([
            IngredientAllergen(ingredient_id=ing_huevo.id, allergen_id=all_huevo.id),
            IngredientAllergen(ingredient_id=ing_parmesano.id, allergen_id=all_lacteos.id)
        ])
        db.flush()

        # ===== ETIQUETAS DIETÉTICAS =====
        print("  - Creando etiquetas dietéticas...")
        tag_vegano = DietaryTag(
            id=uuid.uuid4(),
            name="Vegano",
            description="Libre de productos de origen animal",
            badge_color="#2ecc71"
        )
        tag_vegetariano = DietaryTag(
            id=uuid.uuid4(),
            name="Vegetariano",
            description="Apto para vegetarianos",
            badge_color="#27ae60"
        )
        tag_glutenfree = DietaryTag(
            id=uuid.uuid4(),
            name="Gluten Free",
            description="Libre de gluten",
            badge_color="#f1c40f"
        )
        db.add_all([tag_vegano, tag_vegetariano, tag_glutenfree])
        db.flush()

        # ===== CATEGORÍAS =====
        print("  - Creando categorías de menú...")
        cat_entradas = Category(
            id=uuid.uuid4(),
            name="Entradas",
            subtitle="Para empezar",
            description="Entradas y acompañamientos ligeros",
            image_url="https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop&q=60",
            sort_order=1,
            is_active=True
        )
        cat_fondos = Category(
            id=uuid.uuid4(),
            name="Platos de Fondo",
            subtitle="Los clásicos de la casa",
            description="Nuestras carnes y especialidades",
            image_url="https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60",
            sort_order=2,
            is_active=True
        )
        cat_ensaladas = Category(
            id=uuid.uuid4(),
            name="Ensaladas",
            subtitle="Frescura natural",
            description="Ensaladas saludables y frescas",
            image_url="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60",
            sort_order=3,
            is_active=True
        )
        cat_bebestibles = Category(
            id=uuid.uuid4(),
            name="Bebestibles",
            subtitle="Jugos y bebidas",
            description="Gaseosas y bebidas refrescantes",
            image_url="https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=60",
            sort_order=4,
            is_active=True
        )
        db.add_all([cat_entradas, cat_fondos, cat_ensaladas, cat_bebestibles])
        db.flush()

        # ===== PLATOS / ITEMS DE MENÚ =====
        print("  - Creando platos e ítems...")
        item_empanada = MenuItem(
            id=uuid.uuid4(),
            category_id=cat_entradas.id,
            name="Empanadas de Pino",
            description="Masa horneada rellena de pino tradicional",
            base_price=2490.0,
            image_url="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=60",
            is_available=True,
            is_featured=False,
            sort_order=1
        )
        item_humita = MenuItem(
            id=uuid.uuid4(),
            category_id=cat_entradas.id,
            name="Humitas",
            description="Pasta de choclo tradicional envuelta en hojas",
            base_price=3990.0,
            image_url="https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=60",
            is_available=True,
            is_featured=False,
            sort_order=2
        )
        item_lomo = MenuItem(
            id=uuid.uuid4(),
            category_id=cat_fondos.id,
            name="Lomo a lo Pobre",
            description="Lomo vetado con huevos fritos, papas fritas y cebolla",
            base_price=8990.0,
            image_url="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&auto=format&fit=crop&q=60",
            is_available=True,
            is_featured=True,
            sort_order=1
        )
        item_pollo = MenuItem(
            id=uuid.uuid4(),
            category_id=cat_fondos.id,
            name="Pollo Arvejado",
            description="Pollo cocinado con arvejas y acompañado de arroz",
            base_price=6990.0,
            image_url="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=60",
            is_available=True,
            is_featured=False,
            sort_order=2
        )
        item_cesar = MenuItem(
            id=uuid.uuid4(),
            category_id=cat_ensaladas.id,
            name="Ensalada César",
            description="Lechuga costina, crutones, parmesano y aderezo César",
            base_price=4990.0,
            image_url="https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=60",
            is_available=True,
            is_featured=False,
            sort_order=1
        )
        item_gaseosa = MenuItem(
            id=uuid.uuid4(),
            category_id=cat_bebestibles.id,
            name="Gaseosa",
            description="Bebidas en lata heladas de 350ml",
            base_price=1500.0,
            image_url="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=60",
            is_available=True,
            is_featured=False,
            sort_order=1
        )
        db.add_all([item_empanada, item_humita, item_lomo, item_pollo, item_cesar, item_gaseosa])
        db.flush()

        # ===== VARIANTES DE MENÚ =====
        print("  - Creando variantes de platos...")
        # Variantes de Lomo a lo Pobre (Individual vs Compartir)
        var_lomo_ind = MenuItemVariant(
            id=uuid.uuid4(),
            menu_item_id=item_lomo.id,
            name="Individual",
            sku="LOMO-POBRE-IND",
            price_override=None,
            is_available=True,
            sort_order=1
        )
        var_lomo_comp = MenuItemVariant(
            id=uuid.uuid4(),
            menu_item_id=item_lomo.id,
            name="Para Compartir",
            sku="LOMO-POBRE-COMP",
            price_override=15990.0,
            is_available=True,
            sort_order=2
        )
        # Variantes de Gaseosa (Sabores)
        var_coca = MenuItemVariant(
            id=uuid.uuid4(),
            menu_item_id=item_gaseosa.id,
            name="Coca-Cola Original",
            sku="BEB-COCA-LATA",
            price_override=None,
            is_available=True,
            sort_order=1
        )
        var_coca_zero = MenuItemVariant(
            id=uuid.uuid4(),
            menu_item_id=item_gaseosa.id,
            name="Coca-Cola Sin Azúcar",
            sku="BEB-COCA-ZERO",
            price_override=None,
            is_available=True,
            sort_order=2
        )
        var_fanta = MenuItemVariant(
            id=uuid.uuid4(),
            menu_item_id=item_gaseosa.id,
            name="Fanta Naranja",
            sku="BEB-FANTA-LATA",
            price_override=None,
            is_available=True,
            sort_order=3
        )
        db.add_all([var_lomo_ind, var_lomo_comp, var_coca, var_coca_zero, var_fanta])
        db.flush()

        # ===== GRUPOS DE MODIFICADORES =====
        print("  - Creando grupos de modificadores...")
        grp_termino = ModifierGroup(
            id=uuid.uuid4(),
            name="Término de la Carne",
            description="Punto de cocción para las carnes",
            sort_order=1
        )
        grp_extras = ModifierGroup(
            id=uuid.uuid4(),
            name="Acompañamientos Extra",
            description="Agrega ingredientes adicionales",
            sort_order=2
        )
        db.add_all([grp_termino, grp_extras])
        db.flush()

        # ===== MODIFICADORES =====
        print("  - Creando modificadores...")
        # Términos de carne
        mod_punto = Modifier(
            id=uuid.uuid4(),
            modifier_group_id=grp_termino.id,
            name="A punto",
            price_delta=0.0,
            is_available=True,
            sort_order=1
        )
        mod_tres_cuartos = Modifier(
            id=uuid.uuid4(),
            modifier_group_id=grp_termino.id,
            name="Tres cuartos",
            price_delta=0.0,
            is_available=True,
            sort_order=2
        )
        mod_cocido = Modifier(
            id=uuid.uuid4(),
            modifier_group_id=grp_termino.id,
            name="Bien cocido",
            price_delta=0.0,
            is_available=True,
            sort_order=3
        )
        # Extras
        mod_papas = Modifier(
            id=uuid.uuid4(),
            modifier_group_id=grp_extras.id,
            name="Papas Fritas Extra",
            price_delta=1500.0,
            is_available=True,
            sort_order=1
        )
        mod_huevo = Modifier(
            id=uuid.uuid4(),
            modifier_group_id=grp_extras.id,
            name="Huevo Frito Extra",
            price_delta=500.0,
            is_available=True,
            sort_order=2
        )
        db.add_all([mod_punto, mod_tres_cuartos, mod_cocido, mod_papas, mod_huevo])
        db.flush()

        # ===== JUNCTION: MENU ITEMS & MODIFIER GROUPS =====
        db.add_all([
            MenuItemModifierGroup(
                menu_item_id=item_lomo.id,
                modifier_group_id=grp_termino.id,
                min_selection=1,
                max_selection=1,
                sort_order=1
            ),
            MenuItemModifierGroup(
                menu_item_id=item_lomo.id,
                modifier_group_id=grp_extras.id,
                min_selection=0,
                max_selection=2,
                sort_order=2
            )
        ])
        db.flush()

        # ===== JUNCTION: MENU ITEMS & INGREDIENTS =====
        db.add_all([
            MenuItemIngredient(menu_item_id=item_lomo.id, ingredient_id=ing_lomo.id, quantity="250g", is_main=True),
            MenuItemIngredient(menu_item_id=item_lomo.id, ingredient_id=ing_papas.id, quantity="300g", is_main=False),
            MenuItemIngredient(menu_item_id=item_lomo.id, ingredient_id=ing_huevo.id, quantity="2 unidades", is_main=False),
            MenuItemIngredient(menu_item_id=item_cesar.id, ingredient_id=ing_parmesano.id, quantity="40g", is_main=False),
            MenuItemIngredient(menu_item_id=item_cesar.id, ingredient_id=ing_lechuga.id, quantity="1 unidad", is_main=True)
        ])
        db.flush()

        # ===== JUNCTION: MENU ITEMS & DIETARY TAGS =====
        db.add_all([
            MenuItemDietaryTag(menu_item_id=item_cesar.id, dietary_tag_id=tag_vegetariano.id, is_auto_applied=False),
            MenuItemDietaryTag(menu_item_id=item_humita.id, dietary_tag_id=tag_vegetariano.id, is_auto_applied=False)
        ])
        db.flush()

        db.commit()
        print("\n✓ Seed completado exitosamente")
        print("\nUsuarios de prueba:")
        print("  Admin:     admin@restoapp.cl / admin123")
        print("  Encargado: encargado@restoapp.cl / encargado123")
        print("  Cliente:   customer@test.cl / cliente123")
    except Exception as e:
        db.rollback()
        print(f"\n✗ Error durante la ejecución del seed: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()
