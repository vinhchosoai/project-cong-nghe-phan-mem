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
        # Try to authenticate by email first, then username
        user = await service.get_user_by_email(credentials.email)
        if not user or not service.verify_password(credentials.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        access_token = service.get_access_token(user.user_id)
        
        # Get tenant_id if user is restaurant owner
        tenant_id = None
        if user.role == "restaurant_owner":
            # This logic mimics getting tenant for user - ideally usage of service
            # For now direct query or fetching user.tenants if loaded
            # We know user.tenants is a relationship. We need to eager load or query.
            # Let's assume passed via service or just query here.
            # To keep it simple and safe, let's just use what we have or skip validation if None
            # Actually, let's update UserService to return it or query it.
            # But wait, UserLoginResponse needs it.
            # Let's check if User model has it. No.
            # Let's query Tenant.
            stmt = select(Tenant).where(Tenant.user_id == user.user_id)
            result = await db.execute(stmt)
            tenant = result.scalar_one_or_none()
            if tenant:
                tenant_id = tenant.tenant_id

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
    """
    Get current user.
    """
    # If customer, fetch points
    if current_user.role == "customer":
        result = await db.execute(select(Customer).where(Customer.user_id == current_user.user_id))
        customer = result.scalar_one_or_none()
        if customer:
            # Dynamically attach points to the response object (Pydantic will handle it if in schema)
            # We might need to construct a dict or object to match UserResponse
            # Or simpler: set text attribute on model instance if valid, but better to return a dict
            user_dict = current_user.__dict__.copy()
            user_dict['current_points'] = customer.current_points
            return user_dict
    
    return current_user


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
