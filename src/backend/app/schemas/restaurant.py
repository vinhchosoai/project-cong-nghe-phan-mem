from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from datetime import time

class RestaurantBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    phone_contact: str
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    open_time: time
    close_time: time

class RestaurantCreate(RestaurantBase):
    owner_email: str 

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    open_time: Optional[time] = None
    close_time: Optional[time] = None
    is_active: Optional[bool] = None

class RestaurantResponse(RestaurantBase):
    id: UUID
    is_active: bool
    rating: float = 0.0
    
    model_config = {"from_attributes": True}

class TableBase(BaseModel):
    name: str
    capacity: int

class TableCreate(TableBase):
    pass

class TableResponse(TableBase):
    id: UUID
    restaurant_id: UUID
    qr_code_url: Optional[str] = None
    status: str 

    model_config = {"from_attributes": True}