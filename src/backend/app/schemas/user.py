from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
from app.schemas.enums import UserRole, MembershipTier

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[UserRole] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.CUSTOMER

class StaffCreate(UserBase):
    password: str
    role: UserRole
    restaurant_id: UUID

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    role: UserRole
    avatar_url: Optional[str] = None
    membership_tier: MembershipTier = MembershipTier.IRON
    points: int = 0

    model_config = {"from_attributes": True}

class UserLogin(BaseModel):
    email: EmailStr
    password: str