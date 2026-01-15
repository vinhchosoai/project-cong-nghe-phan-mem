from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from app.schemas.enums import OrderStatus, PaymentMethod

class OrderItemBase(BaseModel):
    menu_item_id: UUID
    quantity: int
    note: Optional[str] = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: UUID
    item_name: str 
    unit_price: float
    total_price: float

    model_config = {"from_attributes": True}

class OrderCreate(BaseModel):
    restaurant_id: UUID
    table_id: Optional[UUID] = None 
    items: List[OrderItemCreate]

class OrderUpdateStatus(BaseModel):
    status: OrderStatus

class OrderResponse(BaseModel):
    id: UUID
    restaurant_id: UUID
    user_id: Optional[UUID] = None
    table_id: Optional[UUID] = None
    status: OrderStatus
    total_amount: float
    created_at: datetime
    items: List[OrderItemResponse]

    model_config = {"from_attributes": True}

class PaymentRequest(BaseModel):
    order_id: UUID
    payment_method: PaymentMethod
    amount: float