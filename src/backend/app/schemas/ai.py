from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel

class ChatQuery(BaseModel):
    restaurant_id: Optional[UUID] = None
    question: str
    context_history: Optional[List[str]] = None

class ChatResponse(BaseModel):
    answer: str
    suggested_dishes: Optional[List[UUID]] = None

class RecommendationRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    preferences: Optional[List[str]] = None