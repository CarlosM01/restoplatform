# RestoPlatform 🍽️

ERP/SaaS para restaurantes PYME. Stack completo con FastAPI + SQLAlchemy + Astro + React + Webpay + Directus CMS.

## 📦 Stack

- **Backend**: FastAPI 0.115, SQLAlchemy 2.0, Alembic, PostgreSQL 16
- **Frontend**: Astro 4 + React 18, CSS vanilla con design tokens
- **Pagos**: Transbank Webpay Plus (modo integración)
- **CMS Admin**: Directus 11 (opcional, para gestión visual de productos/usuarios)
- **Roles**: Cliente, Encargado (por sede), Admin (dueño)

## 🚀 Inicio rápido con Docker (recomendado)

```bash
# Levantar todo el stack
docker compose up -d

# Esperar ~15 segundos para que la BD inicialice

# Cargar los datos de prueba / iniciales (seed)
make db-seed

# Verificar
curl http://localhost:8000/health
```

Luego solo levantar el frontend (no está en Docker para que tengas hot reload):

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Abrir:
- **Cliente**: http://localhost:4321
- **Login**: http://localhost:4321/login
- **Encargado**: http://localhost:4321/encargado
- **Admin**: http://localhost:4321/admin
- **API docs**: http://localhost:8000/docs
- **Directus CMS**: http://localhost:8055

## 👥 Usuarios de prueba (creados por el seed)

| Rol | Email | Password |
|---|---|---|
| Admin | admin@lalena.cl | admin123 |
| Encargado | encargado@lalena.cl | encargado123 |
| Cliente | cliente@test.cl | cliente123 |

## 🛠️ Setup manual (sin Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Linux/Mac
# .venv\Scripts\activate            # Windows
pip install -r requirements.txt
cp .env.example .env

# PostgreSQL debe estar corriendo en localhost:5432
# Crear DB: createdb restoplatform

# Opción A: Usar Alembic (recomendado para prod)
alembic revision --autogenerate -m "init"
alembic upgrade head

# Opción B: Auto-crear tablas + seed (dev)
python -m app.seed

# Levantar
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## 🗂️ Estructura

```
restoplatform/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry
│   │   ├── core/                # config, db, security
│   │   ├── models/              # SQLAlchemy ORM
│   │   ├── schemas/             # Pydantic
│   │   ├── routers/             # endpoints REST
│   │   ├── deps.py              # auth + RBAC
│   │   └── seed.py              # datos iniciales
│   ├── alembic/                 # migraciones
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/               # rutas Astro
│   │   ├── components/          # React (islas interactivas)
│   │   ├── layouts/
│   │   ├── lib/api.js           # cliente HTTP
│   │   └── styles/global.css    # design system
│   └── astro.config.mjs
└── docker-compose.yml
```

## 🔐 Roles y permisos

| Acción | Cliente | Encargado | Admin |
|---|:-:|:-:|:-:|
| Ver catálogo | ✅ | ✅ | ✅ |
| Crear pedido | ✅ | ✅ | ✅ |
| Pagar con Webpay | ✅ | ✅ | ✅ |
| Ver pedidos de su sede | — | ✅ | ✅ |
| Confirmar/cancelar pedidos | — | ✅ (su sede) | ✅ |
| Modificar stock | — | ✅ (su sede) | ✅ |
| CRUD productos | — | ✅ (su sede) | ✅ |
| CRUD usuarios | — | — | ✅ |
| Banear usuarios | — | — | ✅ |
| Asignar encargados a sedes | — | — | ✅ |

## 💳 Webpay (Transbank)

Las credenciales del `.env.example` son las de **integración pública** de Transbank — sirven para pruebas con tarjetas test.

**Tarjetas de prueba:**
- VISA aprobado: `4051 8856 0044 6623` · CVV `123` · vence `cualquier futuro`
- MASTERCARD aprobado: `5186 0595 5959 0568` · CVV `123`
- Rechazada: `4051 8842 3993 7763`

[Documentación Transbank](https://transbankdevelopers.cl/documentacion/webpay-plus)

Para producción reemplazar `commerce_code`, `api_key` y cambiar `IntegrationType.TEST` → `IntegrationType.LIVE` en `app/routers/pagos.py`.

## 🎨 Directus CMS (opcional pero recomendado)

Directus se conecta a la misma base PostgreSQL y te da un panel admin visual gratis. Ideal para que el dueño/admin gestione productos, usuarios, sedes sin tocar código.

1. Levantar con docker-compose (ya viene incluido)
2. Entrar a http://localhost:8055
3. Login: admin@lalena.cl / admin123
4. Configurar permisos por colección desde Settings → Roles & Permissions
5. (Opcional) Crear roles personalizados que mapean a tus roles de la app

## 🧪 Testing rápido

Probar el flujo completo:

1. Entrar a http://localhost:4321
2. Click en "Ingresar" → login con `cliente@test.cl / cliente123`
3. Agregar platos al carrito → "Siguiente"
4. Elegir fecha, hora, mesa → "Siguiente"
5. Revisar carrito → "Ir a pagar"
6. "Ir a Webpay" → te lleva a la pasarela
7. Usar tarjeta de prueba VISA `4051 8856 0044 6623`
8. Volver y ver pago confirmado

En otra ventana, login como encargado y ver el pedido en `/encargado`.

## 📝 Próximos pasos sugeridos

- [ ] Tests con pytest (especialmente `pedidos.py` con el manejo de stock)
- [ ] WebSockets para notificar al encargado en tiempo real (hoy hay polling cada 8s)
- [ ] Subida de imágenes de productos (S3 o local)
- [ ] Exportar reportes de ventas (CSV/PDF)
- [ ] Multi-idioma (i18n)
- [ ] PWA / instalable

## 🐛 Troubleshooting

**`alembic: command not found`** → asegúrate de tener el venv activado.

**Frontend no se conecta al backend** → verifica que `PUBLIC_API_URL` en `frontend/.env` apunte a `http://localhost:8000`.

**Webpay no carga** → en algunos navegadores Safari/Brave bloquea redirects POST cross-origin. Probar en Chrome/Firefox.

**`OperationalError: could not connect to server`** → PostgreSQL no está corriendo. Si usas Docker: `docker-compose up postgres`.

## 📄 Licencia

MIT — uso libre para el proyecto académico.
