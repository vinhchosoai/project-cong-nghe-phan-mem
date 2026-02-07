from pydantic import BaseModel, Field
from typing import Optional
class IngredientCreate(BaseModel):
    restaurant_id: str
    name: str = Field(..., min_length=2, max_length=255)
    quantity: float = Field(0, ge=0)
    unit: str = Field(..., min_length=1, max_length=50)
    is_available: bool = True
class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = Field(None, ge=0)
    unit: Optional[str] = None
    is_available: Optional[bool] = None
class IngredientResponse(BaseModel):
    ingredient_id: str
    restaurant_id: str
    name: str
    quantity: float
    unit: str
    is_available: bool
    class Config:
        from_attributes = True