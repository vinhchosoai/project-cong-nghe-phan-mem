from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    phone_number: Optional[str] = Field(None, max_length=20)
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = Field(None, max_length=20)
    password: Optional[str] = Field(None, min_length=6)


class UserResponse(BaseModel):
    user_id: str
    username: str
    email: str
    phone_number: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    items: List[UserResponse]
    total: int
    skip: int
    limit: int


class UserLogin(BaseModel):
    username: str
    password: str


class OrderDetailCreate(BaseModel):
    item_id: str
    quantity: int
    unit_price: Decimal
    note: Optional[str] = None


class OrderDetail(OrderDetailCreate):
    order_detail_id: str
    order_id: str
    restaurant_id: str

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    restaurant_id: str
    customer_id: Optional[str] = None
    table_id: Optional[str] = None
    status: str = "pending"
    total_amount: Decimal
    order_details: List[OrderDetailCreate]


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    total_amount: Optional[Decimal] = None


class OrderResponse(BaseModel):
    order_id: str
    restaurant_id: str
    customer_id: Optional[str]
    table_id: Optional[str]
    status: str
    total_amount: Decimal
    created_at: datetime
    order_details: List[OrderDetail] = []

    class Config:
        from_attributes = True


class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    image_url: Optional[str] = None
    is_available: bool = True
    ai_tags: Optional[str] = None


class MenuItemResponse(MenuItemCreate):
    item_id: str
    category_id: str

    class Config:
        from_attributes = True


class ReservationCreate(BaseModel):
    restaurant_id: str
    table_id: Optional[str] = None
    customer_id: Optional[str] = None
    booking_time: datetime
    guest_count: int
    status: str = "confirmed"


class ReservationResponse(ReservationCreate):
    reservation_id: str
    created_at: datetime

    class Config:
        from_attributes = True
