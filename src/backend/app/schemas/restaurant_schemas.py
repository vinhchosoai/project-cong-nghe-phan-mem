from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class RestaurantCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    address: Optional[str] = None


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    status: Optional[bool] = None


class RestaurantResponse(BaseModel):
    restaurant_id: str
    tenant_id: str
    name: str
    address: Optional[str]
    status: bool
    created_at: datetime

    class Config:
        from_attributes = True


class StaffCreate(BaseModel):
    user_id: str
    role: str = Field(..., min_length=3, max_length=50)


class StaffResponse(BaseModel):
    staff_id: str
    restaurant_id: str
    user_id: str
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    display_index: int = 0


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    display_index: Optional[int] = None


class CategoryResponse(BaseModel):
    category_id: str
    restaurant_id: str
    name: str
    display_index: int

    class Config:
        from_attributes = True


class MenuItemCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    image_url: Optional[str] = None
    is_available: bool = True
    ai_tags: Optional[str] = None


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    ai_tags: Optional[str] = None


class MenuItemResponse(BaseModel):
    item_id: str
    category_id: str
    name: str
    description: Optional[str]
    price: float
    image_url: Optional[str]
    is_available: bool
    ai_tags: Optional[str]

    class Config:
        from_attributes = True


class RestaurantTableCreate(BaseModel):
    table_number: int = Field(..., gt=0)
    qr_code_string: Optional[str] = None


class RestaurantTableUpdate(BaseModel):
    table_number: Optional[int] = Field(None, gt=0)
    qr_code_string: Optional[str] = None
    status: Optional[bool] = None


class RestaurantTableResponse(BaseModel):
    table_id: str
    restaurant_id: str
    table_number: int
    qr_code_string: Optional[str]
    status: bool

    class Config:
        from_attributes = True
