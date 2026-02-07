from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.user_schemas import (
    UserCreate, UserResponse, UserLoginRequest, UserLoginResponse, TenantCreate, TenantResponse
)
from sqlalchemy import select
from app.services.user_service import UserService
from app.models.models import Tenant, User, Customer
from app.core.security import get_current_user
from uuid import uuid4
router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        service = UserService(db)
        user = await service.create_user(
            username=user_data.username,
            email=user_data.email,
            phone_number=user_data.phone_number,
            password=user_data.password
        )
        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.post("/login", response_model=UserLoginResponse)
async def login_user(credentials: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        service = UserService(db)
        user = await service.get_user_by_email(credentials.email)
        if not user or not service.verify_password(credentials.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Gmail or password is incorrect")
        access_token = service.get_access_token(user.user_id)
        tenant_id = None
        if user.role == "restaurant_owner":
            stmt = select(Tenant).where(Tenant.user_id == user.user_id)
            result = await db.execute(stmt)
            tenant = result.scalar_one_or_none()
            if tenant:
                tenant_id = tenant.tenant_id
        elif user.role in ['chef', 'waiter', 'manager', 'cashier', 'RESTAURANT_STAFF']:
            from app.models.models import Staff, Restaurant
            stmt = select(Restaurant.tenant_id).join(Staff, Staff.restaurant_id == Restaurant.restaurant_id).where(Staff.user_id == user.user_id)
            result = await db.execute(stmt)
            tenant_id = result.scalar()
        return UserLoginResponse(
            user_id=user.user_id,
            email=user.email,
            username=user.username,
            role=user.role,
            tenant_id=tenant_id,
            access_token=access_token,
            token_type="bearer"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user_dict = current_user.__dict__.copy()
    if current_user.role == "customer":
        result = await db.execute(select(Customer).where(Customer.user_id == current_user.user_id))
        customer = result.scalar_one_or_none()
        if customer:
            user_dict['current_points'] = customer.current_points
    elif current_user.role == "restaurant_owner":
        from app.models.models import Restaurant, Tenant
        stmt = select(Tenant).where(Tenant.user_id == current_user.user_id)
        result = await db.execute(stmt)
        tenant = result.scalar_one_or_none()
        if tenant:
            user_dict['tenant_id'] = tenant.tenant_id
            stmt = select(Restaurant).where(Restaurant.tenant_id == tenant.tenant_id)
            result = await db.execute(stmt)
            restaurant = result.scalars().first()
            if restaurant:
                user_dict['restaurant_id'] = restaurant.restaurant_id
    elif current_user.role in ['chef', 'waiter', 'manager', 'cashier', 'RESTAURANT_STAFF']:
        from app.models.models import Staff, Restaurant
        stmt = select(Staff, Restaurant.tenant_id).join(Restaurant, Staff.restaurant_id == Restaurant.restaurant_id).where(Staff.user_id == current_user.user_id)
        result = await db.execute(stmt)
        record = result.first()
        if record:
            staff, tenant_id = record
            user_dict['staff_id'] = staff.staff_id
            user_dict['restaurant_id'] = staff.restaurant_id
            user_dict['tenant_id'] = tenant_id
    return user_dict
@router.post("/tenant", response_model=TenantResponse)
async def create_tenant(tenant_data: TenantCreate, db: AsyncSession = Depends(get_db)):
    try:
        tenant = Tenant(
            tenant_id=f"tenant-{uuid4().hex[:12]}",
            user_id=tenant_data.user_id
        )
        db.add(tenant)
        await db.commit()
        await db.refresh(tenant)
        return tenant
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))