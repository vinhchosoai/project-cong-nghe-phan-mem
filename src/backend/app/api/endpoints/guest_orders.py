from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.db.session import get_db
from app.services.order_service import OrderService
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdateStatus
from app.schemas.enums import OrderStatus
from app.core.exeptions import BusinessLogicException, ResourceNotFoundException

router = APIRouter()


@router.post(
    "/orders",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    tags=["Guest Orders"]
)
async def create_order(
    order_in: OrderCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a new order as guest"""
    try:
        tenant_id = UUID(request.state.tenant_id)
        
        service = OrderService(db)
        db_order = service.place_order(
            restaurant_id=tenant_id,
            table_id=order_in.table_id,
            items=order_in.items,
            note=None
        )
        
        return {
            "id": str(db_order.id),
            "status": db_order.status.value,
            "total_amount": db_order.total_amount,
            "created_at": db_order.created_at.isoformat() if db_order.created_at else None
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


@router.get(
    "/orders/{order_id}",
    response_model=dict,
    tags=["Guest Orders"]
)
async def get_order_status(
    order_id: UUID,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get order status"""
    try:
        tenant_id = UUID(request.state.tenant_id)
        
        service = OrderService(db)
        order_status = service.get_order_status(
            restaurant_id=tenant_id,
            order_id=order_id
        )
        
        return order_status
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
    "/orders/table/{table_id}",
    response_model=List[dict],
    tags=["Guest Orders"]
)
async def get_table_orders(
    table_id: UUID,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get all orders for a table"""
    try:
        tenant_id = UUID(request.state.tenant_id)
        
        service = OrderService(db)
        orders = service.get_table_orders(
            restaurant_id=tenant_id,
            table_id=table_id
        )
        
        return [
            {
                "id": str(order.id),
                "status": order.status.value,
                "total_amount": order.total_amount,
                "created_at": order.created_at.isoformat() if order.created_at else None,
                "items": len(order.items)
            }
            for order in orders
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post(
    "/orders/{order_id}/status",
    response_model=dict,
    tags=["Guest Orders"]
)
async def update_order_status(
    order_id: UUID,
    status_update: OrderUpdateStatus,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update order status (for staff)"""
    try:
        tenant_id = UUID(request.state.tenant_id)
        
        service = OrderService(db)
        db_order = service.update_order_status(
            restaurant_id=tenant_id,
            order_id=order_id,
            status_update=status_update
        )
        
        return {
            "id": str(db_order.id),
            "status": db_order.status.value,
            "total_amount": db_order.total_amount
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
