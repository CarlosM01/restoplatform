# RestoPlatform 🍽️

ERP/SaaS para restaurantes PYME. Stack completo moderno con FastAPI + SQLAlchemy + Astro + React + Directus CMS.

Este proyecto ha sido optimizado y simplificado para ofrecer un **flujo de compra de alta velocidad para un único local**, incluyendo la opción de **Checkout para Invitados (Guest Checkout)**, la eliminación del complejo sistema de reservas anterior para agilizar los pedidos, y un **bypass de pagos integrado** que simula transacciones instantáneas para facilitar el desarrollo y pruebas locales.

---

## 📦 Stack Tecnológico

- **Backend**: FastAPI 0.115, SQLAlchemy 2.0, Alembic, PostgreSQL 16 (ejecutado en Docker)
- **Frontend**: Astro 4 + React 18, CSS vanilla estructurado con design tokens adaptativos.
- **Servidores de Producción (Dockerizado)**: 
  - **Nginx 1.25** (servidor web de alto rendimiento para el frontend y proxy inverso para la API en `/api`).
  - **Gunicorn 23** (administrador de procesos ASGI con workers **Uvicorn** para escalar la API FastAPI).
- **Simulador de Pagos**: Bypass directo de Transbank Webpay Plus para confirmación inmediata de pedidos locales.
- **CMS Admin**: Directus 11 (opcional, para gestión visual integrada de productos, inventarios y usuarios).
- **Arquitectura**: Simplificada a local único (Single-Venue), reduciendo la complejidad de múltiples sedes.

---

## 🚀 Inicio rápido (Recomendado)

El entorno puede levantarse de dos formas: **Totalmente Dockerizado** (ideal para demostraciones y producción local) o en **Modo Híbrido de Desarrollo** (ideal para editar el frontend con Hot-Reloading).

### Opción A: Despliegue Completo en Docker (Recomendado)
Este método levanta **todos** los servicios (Base de Datos, API Backend con Gunicorn, Frontend con Nginx y Directus CMS) de manera hermética y optimizada.

#### 1. Levantar servicios y compilar el frontend con Nginx
```bash
make build    # Construye las imágenes y compila el frontend estático
make up       # Inicia la base de datos, API, Nginx y CMS en segundo plano
```

#### 2. Cargar semilla de datos (Seed)
```bash
make db-seed  # Inicializa el esquema y carga datos chilenos de prueba
```
*¡Listo! Todo el sistema estará disponible a través de Nginx en los puertos HTTP estándar.*

---

### Opción B: Modo de Desarrollo Frontend (Hot-Reloading)
Si deseas modificar el código de la interfaz React/Astro en tiempo real:

#### 1. Levantar solo la Base de Datos y Backend API
Apaga el contenedor frontend si está corriendo (`docker compose stop frontend`) y ejecuta los servicios base:
```bash
make up
make db-seed
```

#### 2. Arrancar el Frontend de desarrollo localmente en tu host
```bash
make frontend-install  # Instala paquetes de npm
make frontend-dev      # Inicia el servidor de desarrollo Astro (Hot-Reloading en puerto 4321)
```

---

### 🔗 Direcciones del Entorno Local

Dependiendo de la opción que elijas, puedes acceder a las URLs correspondientes:

#### Si usas Opción A (Contenedores de Producción / Nginx):
Toda la plataforma y la API están consolidadas bajo el mismo host a través de Nginx:
- **Catálogo de Clientes**: [http://localhost](http://localhost) (y puerto retrocompatible [http://localhost:4321](http://localhost:4321))
- **Dashboard de Encargado/Manager**: [http://localhost/encargado](http://localhost/encargado) (o `:4321/encargado`)
- **Panel de Administración**: [http://localhost/admin](http://localhost/admin) (o `:4321/admin`)
- **Acceso / Login único**: [http://localhost/login](http://localhost/login) (o `:4321/login`)
- **Documentación Interactiva API (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Directus CMS**: [http://localhost:8055](http://localhost:8055) (Email: `admin@lalena.cl` / Clave: `admin123`)

#### Si usas Opción B (Desarrollo Frontend en Host):
El catálogo y páginas corren en el dev server de Astro:
- **Catálogo de Clientes**: [http://localhost:4321](http://localhost:4321)
- **Dashboard de Encargado/Manager**: [http://localhost:4321/encargado](http://localhost:4321/encargado)
- **Panel de Administración**: [http://localhost:4321/admin](http://localhost:4321/admin)
- **Acceso / Login único**: [http://localhost:4321/login](http://localhost:4321/login)
- **Documentación Interactiva API (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Directus CMS**: [http://localhost:8055](http://localhost:8055) (Email: `admin@lalena.cl` / Clave: `admin123`)


---

## 👥 Usuarios de prueba (Creados por el Seed)

| Rol | Email | Contraseña | Descripción / Alcance |
|---|---|---|---|
| **Admin** | `admin@lalena.cl` | `admin123` | Control total del sistema, CRUD de usuarios, bloqueo y ban |
| **Encargado (Manager)** | `encargado@lalena.cl` | `encargado123` | Gestión de stock, visualización y actualización de pedidos del restaurante |
| **Cliente** | `customer@test.cl` | `cliente123` | Usuario registrado para seguimiento de pedidos e historial |
| **Invitado (Guest)** | *No requiere* | *No requiere* | Checkout rápido sin registro directo en la interfaz de pago |

---

## 🛠️ Setup Manual (Sin Docker)

Si prefieres ejecutar el Backend directamente en tu sistema local en lugar de Docker:

### Backend Manual

1. Tener corriendo un servidor PostgreSQL en `localhost:5432` con una base de datos llamada `restoplatform`.
2. Crear tu entorno virtual de Python e instalar requerimientos:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # En Windows usa: .venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   ```
3. Ejecutar esquema y seed de base de datos:
   ```bash
   python -m app.seed
   ```
4. Levantar servidor local de desarrollo:
   ```bash
   uvicorn app.main:app --reload
   ```

---

## 🗂️ Estructura del Repositorio

```
restoplatform/
├── backend/
│   ├── app/
│   │   ├── main.py              # Punto de entrada de la API FastAPI
│   │   ├── core/                # Configuración global, base de datos y seguridad
│   │   ├── models/              # Modelos de SQLAlchemy ORM (User, Product, Order, etc.)
│   │   ├── schemas/             # Esquemas de validación Pydantic
│   │   ├── routers/             # Módulos y rutas REST (auth, orders, payments, products, admin)
│   │   ├── deps.py              # Dependencias FastAPI (autenticación y roles)
│   │   └── seed.py              # Script semilla de inicialización y carga de platos
│   ├── alembic/                 # Directorio de control de migraciones
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/               # Páginas y enrutamiento nativo Astro (layouts estáticos y vistas)
│   │   ├── components/          # Islas interactivas React (CustomerMenu, AdminDashboard, etc.)
│   │   ├── layouts/             # Contenedor global de layouts HTML
│   │   ├── lib/api.js           # Cliente centralizado de llamadas HTTP a la API
│   │   └── styles/global.css    # Sistema de diseño, paleta de colores y tokens CSS
│   └── astro.config.mjs
├── docs/
│   └── menu_schema.md           # Diagrama y documentación de la base de datos de menús
├── Makefile                     # Herramientas estandarizadas de despliegue y desarrollo
├── docker-compose.yml           # Definición de contenedores (Postgres, Directus)
└── README.md                    # Documentación principal
```

---

## 🔐 Matriz de Roles y Permisos

| Acción | Invitado | Cliente Registrado | Encargado | Admin |
|---|:-:|:-:|:-:|:-:|
| Ver catálogo | ✅ | ✅ | ✅ | ✅ |
| Crear pedido | ✅ | ✅ | ✅ | ✅ |
| Checkout sin cuenta | ✅ | ✅ | ✅ | ✅ |
| Pago simulado automático | ✅ | ✅ | ✅ | ✅ |
| Ver historial propio | — | ✅ | ✅ | ✅ |
| Ver panel de pedidos del local | — | — | ✅ | ✅ |
| Cambiar estado de pedidos (preparando/listo) | — | — | ✅ | ✅ |
| Modificar stock / inventario de platos | — | — | ✅ | ✅ |
| CRUD de menú (Categorías, Productos, Variantes) | — | — | ✅ | ✅ |
| Gestión completa de usuarios (CRUD) | — | — | — | ✅ |
| Banear / Desactivar usuarios | — | — | — | ✅ |

---

## 💳 Simulación e Integración de Pagos

Para acelerar las pruebas del flujo de compra y la experiencia de usuario (UX) local, las transacciones se realizan mediante un **bypass de pagos simulado**:

- Al presionar **"Confirmar y Pagar"** (registrado) o **"Pagar como Invitado"** (invitado), el frontend invoca `/payments/init/{order_id}`.
- El backend crea directamente una transacción marcada como **Pagada (`pagado`)** y actualiza el pedido a **Confirmado (`confirmado`)**, reservando el stock del inventario.
- La respuesta retorna una redirección automática e inmediata al cliente hacia el resultado exitoso en `/payment/result?status=exitoso&pedido={id}`.

> [!NOTE]
> La infraestructura para reconectar una pasarela real como **Transbank Webpay Plus** permanece disponible en la arquitectura. Para reactivar el flujo externo original, se debe configurar el `commerce_code` y `api_key` en `backend/app/routers/payments.py` y actualizar el callback de retorno en `frontend/src/pages/payment/return.astro`.

---

## 🎨 Directus CMS (Opcional)

Directus se conecta de manera transparente a la misma instancia de PostgreSQL que la API FastAPI, ofreciendo una consola visual de control:

1. Ingresa a [http://localhost:8055](http://localhost:8055).
2. Credenciales: `admin@lalena.cl` / `admin123`.
3. Permite la visualización rápida de la data, modificación directa de stock y supervisión del estado físico de las mesas cargadas en el restaurante.

---

## 🧪 Guía de Pruebas de Flujo

Experimenta con todo el ciclo de vida del pedido con los siguientes pasos sencillos:

1. **Catálogo**: Entra a [http://localhost:4321](http://localhost:4321). Observa el menú dinámico agrupado por categorías de la semilla chilena tradicional (Carne, Pollo, Ensaladas, Entradas, etc.).
2. **Selección**: Añade platos al carrito (ej. un *Lomo a lo Pobre* y una *Empanada de Pino*).
3. **Carrito**: Haz clic en el indicador de progreso o "Siguiente" para avanzar al resumen.
4. **Pago**: Avanza a la pantalla de pago.
   - *Caso A (Invitado)*: Selecciona **"Pagar como Invitado"**.
   - *Caso B (Registrado)*: Inicia sesión con `customer@test.cl` / `cliente123` y presiona **"Confirmar y Pagar"**.
5. **Resultado**: Serás redirigido instantáneamente al recibo con estado **¡Pago Aceptado!** y tu número de pedido único.
6. **Administración**: En paralelo, accede a la interfaz de Encargado [http://localhost:4321/encargado](http://localhost:4321/encargado). Observa cómo el pedido ingresa en tiempo real y el stock correspondiente se descuenta del inventario disponible.

---

## 📄 Licencia

MIT — Proyecto académico y de uso libre para gestión y demostraciones de ERPs gastronómicos.
