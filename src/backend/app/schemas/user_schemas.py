from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional, List
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    phone_number: Optional[str] = None
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)
    @field_validator('password')
    def validate_password_length(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password cannot be longer than 72 bytes')
        return v
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
class UserResponse(UserBase):
    user_id: str
    role: str
    created_at: datetime
    current_points: Optional[int] = 0
    restaurant_id: Optional[str] = None
    staff_id: Optional[str] = None
    class Config:
        from_attributes = True
class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str
class UserLoginResponse(BaseModel):
    user_id: str
    email: str
    username: str
    role: str
    tenant_id: Optional[str] = None
    access_token: str
    token_type: str = "bearer"
class TenantCreate(BaseModel):
    user_id: str
class TenantResponse(BaseModel):
    tenant_id: str
    user_id: str
    created_at: datetime
    class Config:
        from_attributes = True