from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel

T = TypeVar("T")

class ResponseBase(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None

class PaginationResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int