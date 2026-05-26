from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.models import Role, OrderStatus, PaymentStatus


# ============ USUARIOS ============
class UserBase(BaseModel):
    rut: str = Field(..., min_length=8, max_length=12)
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class UserAdminCreate(UserCreate):
    role: Role = Role.CUSTOMER


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    role: Role | None = None
    is_active: bool | None = None
    is_banned: bool | None = None


class UserOut(UserBase):
    id: int
    role: Role
    is_active: bool
    is_banned: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str





# ============ PRODUCTOS ============
class InventoryOut(BaseModel):
    stock: int
    minimum_stock: int
    model_config = ConfigDict(from_attributes=True)


class ProductCategoryOut(BaseModel):
    name: str
    image: str | None = None
    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    name: str
    description: str = ""
    price: float = Field(..., gt=0)
    category: str
    image: str = ""
    modifiers: list[dict] | None = None
    rating: float | None = 4.5
    tag_class: str | None = None
    tag_label: str | None = None
    ingredients: list[str] | None = None


class ProductCreate(ProductBase):
    stock_inicial: int = 0
    minimum_stock: int = 5
    allergens: list[dict] | None = None
    sizes: list[dict] | None = None
    extras: list[dict] | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    category: str | None = None
    image: str | None = None
    is_active: bool | None = None
    modifiers: list[dict] | None = None
    rating: float | None = None
    tag_class: str | None = None
    tag_label: str | None = None
    ingredients: list[str] | None = None
    minimum_stock: int | None = None
    allergens: list[dict] | None = None
    sizes: list[dict] | None = None
    extras: list[dict] | None = None


class ProductAllergenOut(BaseModel):
    id: int
    name: str
    severity: str | None = None
    icon: str | None = None
    label: str | None = None
    model_config = ConfigDict(from_attributes=True)


class ProductSizeOut(BaseModel):
    id: int
    name: str
    price_delta: float
    model_config = ConfigDict(from_attributes=True)


class ProductExtraOut(BaseModel):
    id: int
    name: str
    price: float
    model_config = ConfigDict(from_attributes=True)


class ProductImageGalleryOut(BaseModel):
    id: int
    url: str
    alt_text: str | None = None
    sort_order: int
    model_config = ConfigDict(from_attributes=True)


class ProductImageGalleryItem(BaseModel):
    url: str
    alt_text: str | None = None
    sort_order: int = 0


class ProductImageBulkSet(BaseModel):
    images: list[ProductImageGalleryItem]


class ProductOut(ProductBase):
    id: int
    is_active: bool
    inventory: InventoryOut | None = None
    allergens: list[ProductAllergenOut] = []
    sizes: list[ProductSizeOut] = []
    extras: list[ProductExtraOut] = []
    gallery: list[ProductImageGalleryOut] = []
    model_config = ConfigDict(from_attributes=True)


class StockUpdate(BaseModel):
    stock: int = Field(..., ge=0)
    minimum_stock: int | None = None


# ============ MESAS ============
class TableBase(BaseModel):
    number: int
    capacity: int = 4


class TableCreate(TableBase):
    pass


class TableOut(TableBase):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)





# ============ PEDIDOS ============
class OrderItemModifier(BaseModel):
    name: str
    price_delta: float


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1)
    modifiers: list[OrderItemModifier] | None = None


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    modifiers: list[dict] | None = None
    model_config = ConfigDict(from_attributes=True)


class OrderOut(BaseModel):
    id: int
    customer_id: int | None

    total: float
    status: OrderStatus
    created_at: datetime
    items: list[OrderItemOut]
    model_config = ConfigDict(from_attributes=True)


# ============ PAGOS ============
class PaymentInit(BaseModel):
    url: str
    token: str


class PaymentOut(BaseModel):
    id: int
    order_id: int
    amount: float
    status: PaymentStatus
    model_config = ConfigDict(from_attributes=True)


# ============ PRODUCT TAGS ============
class ProductTagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field("#FF9F43", max_length=50)


class ProductTagCreate(ProductTagBase):
    pass


class ProductTagUpdate(BaseModel):
    name: str | None = None
    color: str | None = None


class ProductTagOut(ProductTagBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
