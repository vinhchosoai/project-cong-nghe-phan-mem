from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.session import get_db
from app.services.user_service import UserService
from app.schemas.user_schemas import UserResponse, UserCreate, UserUpdate
from app.models.models import User
from app.core.security import get_current_user
from app.core.exceptions import ConflictException, NotFoundException
router = APIRouter(prefix="/api/v1/admin/users", tags=["admin-users"])
async def verify_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this resource"
        )
    return current_user
from app.services.restaurant_service import RestaurantService
from app.schemas.restaurant_schemas import RestaurantResponse, RestaurantCreate, RestaurantUpdate
from app.models.models import Restaurant
from pydantic import BaseModel
class RestaurantWithOwnerCreate(BaseModel):
    restaurant_name: str
    restaurant_address: str
    owner_username: str
    owner_email: str
    owner_password: str
    owner_phone: str | None = None
@router.get("/restaurants", response_model=List[RestaurantResponse])
async def list_all_restaurants(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(verify_admin)
):
    try:
        from sqlalchemy import select
        stmt = select(Restaurant)
        result = await db.execute(stmt)
        restaurants = result.scalars().all()
        return restaurants
    except Exception as e:
        print(f"Error listing restaurants: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list restaurants: {str(e)}")
@router.post("/restaurants", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_restaurant_with_owner(
    data: RestaurantWithOwnerCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(verify_admin)
):
    try:
        from uuid import uuid4
        from app.models.models import Tenant
        user_service = UserService(db)
        owner = await user_service.create_user(
            username=data.owner_username,
            email=data.owner_email,
            phone_number=data.owner_phone,
            password=data.owner_password
        )
        print(f"✓ Created owner user: {owner.user_id}")
        owner.role = "restaurant_owner"
        await db.commit()
        await db.refresh(owner)
        print(f"✓ Updated owner role to restaurant_owner")
        tenant_id = f"tenant-{uuid4().hex[:12]}"
        tenant = Tenant(
            tenant_id=tenant_id,
            user_id=owner.user_id
        )
        db.add(tenant)
        await db.commit()
        await db.refresh(tenant)
        print(f"✓ Created tenant: {tenant_id}")
        restaurant_id = f"rest-{uuid4().hex[:12]}"
        restaurant = Restaurant(
            restaurant_id=restaurant_id,
            tenant_id=tenant_id,
            name=data.restaurant_name,
            address=data.restaurant_address,
            status=True,
        )
        db.add(restaurant)
        print(f"✓ Added restaurant to session: {restaurant_id}")
        await db.commit()
        print(f"✓ Committed restaurant")
        await db.refresh(restaurant)
        print(f"✓ Refreshed restaurant")
        result = {
            "message": "Restaurant and owner created successfully",
            "restaurant_id": restaurant.restaurant_id,
            "owner_id": owner.user_id,
            "tenant_id": tenant_id
        }
        print(f"✓ Returning result: {result}")
        return result
    except ConflictException as e:
        print(f"✗ ConflictException: {e}")
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        print(f"✗ Exception during restaurant creation: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
@router.delete("/restaurants/{restaurant_id}")
async def delete_restaurant_admin(
    restaurant_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(verify_admin)
):
    restaurant = await db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    await db.delete(restaurant)
    await db.commit()
    return {"message": "Restaurant deleted"}
@router.put("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant_admin(
    restaurant_id: str,
    restaurant_data: RestaurantUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(verify_admin)
):
    service = RestaurantService(db)
    updated_restaurant = await service.update_restaurant(
        restaurant_id=restaurant_id,
        name=restaurant_data.name,
        address=restaurant_data.address,
        status=restaurant_data.status
    )
    if not updated_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return updated_restaurant
@router.get("", response_model=List[UserResponse])
async def list_all_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(verify_admin)
):
    service = UserService(db)
    users, _ = await service.list_users(skip=skip, limit=limit)
    return users
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(verify_admin)
):
    service = UserService(db)
    try:
        user = await service.get_user_by_id(user_id)
        return user
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_admin(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(verify_admin)
):
    service = UserService(db)
    try:
        user = await service.create_user(
            username=user_data.username,
            email=user_data.email,
            phone_number=user_data.phone_number,
            password=user_data.password
        )
        return user
    except ConflictException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
@router.put("/{user_id}", response_model=UserResponse)
async def update_user_admin(
    user_id: str,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(verify_admin)
):
    service = UserService(db)
    try:
        updated_user = await service.update_user(
            user_id=user_id,
            email=user_data.email,
            phone_number=user_data.phone_number,
            password=user_data.password
        )
        return updated_user
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ConflictException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_admin(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(verify_admin)
):
    service = UserService(db)
    try:
        await service.delete_user(user_id)
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))