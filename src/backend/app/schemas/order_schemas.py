from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
class OrderItemCreate(BaseModel):
    item_id: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    note: Optional[str] = None
class OrderCreate(BaseModel):
    restaurant_id: str
    customer_id: Optional[str] = None
    table_id: Optional[str] = None
    items: List[OrderItemCreate]
class OrderUpdate(BaseModel):
    status: Optional[str] = None
class OrderDetailResponse(BaseModel):
    order_detail_id: str
    order_id: str
    item_id: str
    quantity: int
    unit_price: float
    note: Optional[str]
    class Config:
        from_attributes = True
class OrderResponse(BaseModel):
    order_id: str
    restaurant_id: str
    customer_id: Optional[str]
    table_id: Optional[str]
    status: str
    total_amount: float
    created_at: datetime
    order_details: List[OrderDetailResponse] = []
    class Config:
        from_attributes = True
class InvoiceCreate(BaseModel):
    order_id: str
    payment_method: str
    customer_id: Optional[str] = None
class InvoiceResponse(BaseModel):
    invoice_id: str
    order_id: str
    customer_id: Optional[str]
    payment_method: Optional[str]
    amount_paid: float
    payment_time: datetime
    class Config:
        from_attributes = True
class CustomerCreate(BaseModel):
    user_id: str
    membership_tier: Optional[str] = "IRON"
class CustomerUpdate(BaseModel):
    membership_tier: Optional[str] = None
    current_points: Optional[int] = None
class CustomerResponse(BaseModel):
    customer_id: str
    user_id: str
    membership_tier: str
    current_points: int
    class Config:
        from_attributes = True
class ReservationCreate(BaseModel):
    restaurant_id: str
    table_id: Optional[str] = None
    customer_id: Optional[str] = None
    booking_time: datetime
    guest_count: int = Field(..., gt=0)
class ReservationUpdate(BaseModel):
    status: Optional[str] = None
class ReservationResponse(BaseModel):
    reservation_id: str
    restaurant_id: str
    table_id: Optional[str]
    customer_id: Optional[str]
    booking_time: datetime
    guest_count: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True