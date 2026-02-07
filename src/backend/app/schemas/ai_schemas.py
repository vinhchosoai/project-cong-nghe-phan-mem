from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
class ChatMessageCreate(BaseModel):
    restaurant_id: str
    customer_id: Optional[str] = None
    message: str = Field(..., min_length=1)
    user_type: str = Field(default="customer")
class ChatMessageResponse(BaseModel):
    chat_log_id: str
    restaurant_id: str
    customer_id: Optional[str]
    message: str
    response: Optional[str]
    user_type: str
    created_at: datetime
    class Config:
        from_attributes = True
class RecommendationRequest(BaseModel):
    restaurant_id: str
    customer_id: Optional[str] = None
    preferences: Optional[str] = None
    budget: Optional[float] = None
class RecommendationResponse(BaseModel):
    item_id: str
    name: str
    description: Optional[str]
    price: float
    recommendation_score: float
    class Config:
        from_attributes = True