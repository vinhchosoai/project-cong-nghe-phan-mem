from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.services.menu_service import MenuService
from app.schemas.menu import MenuItemCreate, MenuItemUpdate, MenuItemResponse, CategoryResponse
from app.core.exeptions import BusinessLogicException, ResourceNotFoundException

router = APIRouter()


@router.get(
    "/restaurants/{restaurant_id}/menu",
    response_model=List[dict],
    tags=["Menu"]
)
async def get_restaurant_menu(
    restaurant_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all menu items for a restaurant"""
    try:
        service = MenuService(db)
        items = service.get_restaurant_menu(restaurant_id)
        
        return [
            {
                "id": str(item.id),
                "name": item.name,
                "description": item.description,
                "price": item.price,
                "category_id": str(item.category_id),
                "is_available": item.is_available,
                "image_url": item.image_url
            }
            for item in items
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get(
    "/restaurants/{restaurant_id}/menu/category/{category_id}",
    response_model=List[dict],
    tags=["Menu"]
)
async def get_menu_by_category(
    restaurant_id: UUID,
    category_id: UUID,
    db: Session = Depends(get_db)
):
    """Get menu items by category"""
    try:
        service = MenuService(db)
        items = service.get_menu_by_category(restaurant_id, category_id)
        
        return [
            {
                "id": str(item.id),
                "name": item.name,
                "price": item.price,
                "is_available": item.is_available
            }
            for item in items
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post(
    "/restaurants/{restaurant_id}/menu/items",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    tags=["Menu Management"]
)
async def create_menu_item(
    restaurant_id: UUID,
    item_in: MenuItemCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a new menu item (staff only)"""
    try:
        tenant_id = UUID(request.state.tenant_id)
        if tenant_id != restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create items for other restaurants"
            )
        
        service = MenuService(db)
        db_item = service.create_menu_item(restaurant_id, item_in)
        
        return {
            "id": str(db_item.id),
            "name": db_item.name,
            "price": db_item.price,
            "is_available": db_item.is_available
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


@router.put(
    "/restaurants/{restaurant_id}/menu/items/{item_id}",
    response_model=dict,
    tags=["Menu Management"]
)
async def update_menu_item(
    restaurant_id: UUID,
    item_id: UUID,
    item_in: MenuItemUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update a menu item"""
    try:
        tenant_id = UUID(request.state.tenant_id)
        if tenant_id != restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot update items for other restaurants"
            )
        
        service = MenuService(db)
        db_item = service.update_menu_item(restaurant_id, item_id, item_in)
        
        return {
            "id": str(db_item.id),
            "name": db_item.name,
            "price": db_item.price,
            "is_available": db_item.is_available
        }
    except BusinessLogicException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
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


@router.patch(
    "/restaurants/{restaurant_id}/menu/items/{item_id}/availability",
    response_model=dict,
    tags=["Menu Management"]
)
async def toggle_menu_item_availability(
    restaurant_id: UUID,
    item_id: UUID,
    is_available: bool,
    request: Request,
    db: Session = Depends(get_db)
):
    """Toggle menu item availability"""
    try:
        tenant_id = UUID(request.state.tenant_id)
        if tenant_id != restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot update items for other restaurants"
            )
        
        service = MenuService(db)
        db_item = service.toggle_availability(restaurant_id, item_id, is_available)
        
        return {
            "id": str(db_item.id),
            "name": db_item.name,
            "is_available": db_item.is_available
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
