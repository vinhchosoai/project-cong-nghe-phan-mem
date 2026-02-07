from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.services.staff_service import StaffService
from app.models.models import User, Staff, Restaurant, Tenant
from app.core.security import get_current_user
from pydantic import BaseModel, EmailStr
from typing import List
router = APIRouter(prefix="/api/v1/staff", tags=["Staff Management"])
async def get_user_restaurant_id(current_user: User, db: AsyncSession) -> str:
    if current_user.role != "restaurant_owner":
        raise HTTPException(status_code=403, detail="Only restaurant owners can manage staff")
    stmt = select(Tenant).where(Tenant.user_id == current_user.user_id)
    result = await db.execute(stmt)
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="No tenant found for this user")
    stmt = select(Restaurant).where(Restaurant.tenant_id == tenant.tenant_id)
    result = await db.execute(stmt)
    restaurant = result.scalars().first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="No restaurant found for this owner")
    return restaurant.restaurant_id
class StaffCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str
class StaffUpdate(BaseModel):
    role: str
class StaffResponse(BaseModel):
    staff_id: str
    user_id: str
    username: str
    email: str
    role: str
    restaurant_id: str
    class Config:
        from_attributes = True
@router.post("", response_model=StaffResponse)
async def create_staff(
    staff_data: StaffCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    restaurant_id = await get_user_restaurant_id(current_user, db)
    service = StaffService(db)
    staff = await service.create_staff(restaurant_id, staff_data.dict())
    return StaffResponse(
        staff_id=staff.staff_id,
        user_id=staff.user_id,
        username=staff_data.username,
        email=staff_data.email,
        role=staff.role,
        restaurant_id=staff.restaurant_id
    )
@router.get("", response_model=List[StaffResponse])
async def get_staff(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    restaurant_id = await get_user_restaurant_id(current_user, db)
    service = StaffService(db)
    staff_list = await service.get_restaurant_staff(restaurant_id)
    return [
        StaffResponse(
            staff_id=s.staff_id,
            user_id=s.user_id,
            username=s.user.username if s.user else "Unknown",
            email=s.user.email if s.user else "Unknown",
            role=s.role,
            restaurant_id=s.restaurant_id
        ) for s in staff_list
    ]
@router.put("/{staff_id}", response_model=StaffResponse)
async def update_staff(
    staff_id: str,
    staff_data: StaffUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "restaurant_owner":
        raise HTTPException(status_code=403, detail="Not authorized")
    service = StaffService(db)
    updated_staff = await service.update_staff_role(staff_id, staff_data.role)
    return StaffResponse(
        staff_id=updated_staff.staff_id,
        user_id=updated_staff.user_id,
        username=updated_staff.user.username,
        email=updated_staff.user.email,
        role=updated_staff.role,
        restaurant_id=updated_staff.restaurant_id
    )
@router.delete("/{staff_id}")
async def delete_staff(
    staff_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "restaurant_owner":
        raise HTTPException(status_code=403, detail="Not authorized")
    service = StaffService(db)
    await service.remove_staff(staff_id)
    return {"message": "Staff removed"}