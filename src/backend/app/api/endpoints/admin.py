from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.crud.crud_restaurant import restaurant
from app.crud.crud_user import user
from app.schemas.restaurant import RestaurantResponse
from app.schemas.user import UserResponse

router = APIRouter()


@router.get(
    "/restaurants",
    response_model=List[RestaurantResponse],
    tags=["Admin"]
)
async def get_all_restaurants(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all restaurants (admin only)"""
    restaurants_list = restaurant.get_multi(db, skip=skip, limit=limit)
    return [RestaurantResponse.model_validate(r) for r in restaurants_list]


@router.patch(
    "/restaurants/{restaurant_id}/activate",
    response_model=dict,
    tags=["Admin"]
)
async def activate_restaurant(
    restaurant_id: UUID,
    db: Session = Depends(get_db)
):
    """Activate a restaurant (admin only)"""
    db_restaurant = restaurant.get(db, restaurant_id)
    if not db_restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Restaurant {restaurant_id} not found"
        )
    
    db_restaurant.is_active = True
    db.commit()
    db.refresh(db_restaurant)
    
    return {
        "id": str(db_restaurant.id),
        "name": db_restaurant.name,
        "is_active": db_restaurant.is_active
    }


@router.patch(
    "/restaurants/{restaurant_id}/deactivate",
    response_model=dict,
    tags=["Admin"]
)
async def deactivate_restaurant(
    restaurant_id: UUID,
    db: Session = Depends(get_db)
):
    """Deactivate a restaurant (admin only)"""
    db_restaurant = restaurant.get(db, restaurant_id)
    if not db_restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Restaurant {restaurant_id} not found"
        )
    
    db_restaurant.is_active = False
    db.commit()
    db.refresh(db_restaurant)
    
    return {
        "id": str(db_restaurant.id),
        "name": db_restaurant.name,
        "is_active": db_restaurant.is_active
    }


@router.get(
    "/users",
    response_model=List[UserResponse],
    tags=["Admin"]
)
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users_list = user.get_multi(db, skip=skip, limit=limit)
    return [UserResponse.model_validate(u) for u in users_list]


@router.patch(
    "/users/{user_id}/deactivate",
    response_model=dict,
    tags=["Admin"]
)
async def deactivate_user(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    """Deactivate a user (admin only)"""
    db_user = user.get(db, user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    
    db_user.is_active = False
    db.commit()
    db.refresh(db_user)
    
    return {
        "id": str(db_user.id),
        "email": db_user.email,
        "is_active": db_user.is_active
    }
