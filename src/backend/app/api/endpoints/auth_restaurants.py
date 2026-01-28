from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.services.auth_service import AuthService
from app.services.restaurant_service import RestaurantService
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenData
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate, RestaurantResponse
from app.core.exeptions import (
    BusinessLogicException,
    UnauthorizedException,
    ResourceNotFoundException
)

router = APIRouter()


@router.post(
    "/auth/register",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"]
)
async def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    try:
        service = AuthService(db)
        user = service.register_user(user_in)
        return {
            "message": "User registered successfully",
            "user": user.model_dump()
        }
    except BusinessLogicException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post(
    "/auth/login",
    response_model=TokenData,
    tags=["Authentication"]
)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Login user"""
    try:
        service = AuthService(db)
        result = service.login(credentials.email, credentials.password)
        return result
    except UnauthorizedException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post(
    "/restaurants",
    response_model=RestaurantResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Restaurants"]
)
async def create_restaurant(
    restaurant_in: RestaurantCreate,
    db: Session = Depends(get_db)
):
    """Create a new restaurant"""
    try:
        service = RestaurantService(db)
        # TODO: Get user_id from token
        # For now, use a placeholder
        from uuid import UUID
        user_id = UUID(int=1)
        
        result = service.create_restaurant(restaurant_in, user_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get(
    "/restaurants",
    response_model=List[RestaurantResponse],
    tags=["Restaurants"]
)
async def get_restaurants(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all active restaurants"""
    try:
        service = RestaurantService(db)
        restaurants = service.get_all_restaurants(skip, limit)
        return restaurants
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get(
    "/restaurants/{restaurant_id}",
    response_model=RestaurantResponse,
    tags=["Restaurants"]
)
async def get_restaurant(
    restaurant_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a specific restaurant"""
    try:
        service = RestaurantService(db)
        restaurant = service.get_restaurant(restaurant_id)
        
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Restaurant {restaurant_id} not found"
            )
        
        return restaurant
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put(
    "/restaurants/{restaurant_id}",
    response_model=RestaurantResponse,
    tags=["Restaurants"]
)
async def update_restaurant(
    restaurant_id: UUID,
    restaurant_in: RestaurantUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update a restaurant"""
    try:
        tenant_id = UUID(request.state.tenant_id)
        # TODO: Get user_id from token
        user_id = tenant_id
        
        service = RestaurantService(db)
        result = service.update_restaurant(restaurant_id, restaurant_in, user_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post(
    "/restaurants/{restaurant_id}/tables",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    tags=["Tables"]
)
async def create_table(
    restaurant_id: UUID,
    table_name: str,
    capacity: int = 4,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Create a table for the restaurant"""
    try:
        service = RestaurantService(db)
        table = service.create_table(restaurant_id, table_name, capacity)
        
        return {
            "id": str(table.id),
            "name": table.name,
            "capacity": table.capacity,
            "status": table.status.value
        }
    except ResourceNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get(
    "/restaurants/{restaurant_id}/tables",
    response_model=List[dict],
    tags=["Tables"]
)
async def get_restaurant_tables(
    restaurant_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all tables for a restaurant"""
    try:
        service = RestaurantService(db)
        tables = service.get_restaurant_tables(restaurant_id)
        
        return [
            {
                "id": str(table.id),
                "name": table.name,
                "capacity": table.capacity,
                "status": table.status.value,
                "qr_code_url": table.qr_code_url
            }
            for table in tables
        ]
    except ResourceNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
