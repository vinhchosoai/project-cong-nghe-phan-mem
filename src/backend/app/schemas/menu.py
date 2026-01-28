from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    display_order: int = 0

class CategoryCreate(CategoryBase):
    restaurant_id: UUID

class CategoryResponse(CategoryBase):
    id: UUID
    restaurant_id: UUID
    
    model_config = {"from_attributes": True}

class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_available: bool = True
    is_vegetarian: bool = False
    is_spicy: bool = False

class MenuItemCreate(MenuItemBase):
    category_id: UUID
    restaurant_id: UUID

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    is_available: Optional[bool] = None

class MenuItemResponse(MenuItemBase):
    id: UUID
    category_id: UUID
    restaurant_id: UUID
    rating: float = 0.0

    model_config = {"from_attributes": True}

class MenuWithCategoryResponse(CategoryResponse):
    items: List[MenuItemResponse]