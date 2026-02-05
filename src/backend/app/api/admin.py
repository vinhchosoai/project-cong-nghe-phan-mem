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
    """Verify that current user is admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this resource"
        )
    return current_user


@router.get("", response_model=List[UserResponse])
async def list_all_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(verify_admin)
):
    """List all users (admin only)"""
    service = UserService(db)
    users, _ = await service.list_users(skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(verify_admin)
):
    """Get specific user (admin only)"""
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
    """Create new user (admin only)"""
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
    """Update user (admin only)"""
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
    """Delete user (admin only)"""
    service = UserService(db)
    try:
        await service.delete_user(user_id)
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Restaurant Management
from app.services.restaurant_service import RestaurantService
from app.schemas.restaurant_schemas import RestaurantResponse, RestaurantCreate
from app.models.models import Restaurant

@router.get("/restaurants", response_model=List[RestaurantResponse])
async def list_all_restaurants(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(verify_admin)
):
    """List all restaurants (admin only)"""
    from sqlalchemy import select
    result = await db.execute(select(Restaurant))
    return result.scalars().all()

@router.delete("/restaurants/{restaurant_id}")
async def delete_restaurant_admin(
    restaurant_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(verify_admin)
):
    # Direct DB delete to bypass tenant checks for admin
    restaurant = await db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    await db.delete(restaurant)
    await db.commit()
    return {"message": "Restaurant deleted"}

