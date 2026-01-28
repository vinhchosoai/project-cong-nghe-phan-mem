from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.db.session import get_db
from app.api.deps import get_current_user
from app.services.customer_service import CustomerService
from app.core.exeptions import ResourceNotFoundException, BusinessLogicException

router = APIRouter()


@router.get(
    "/profile",
    response_model=dict,
    tags=["Customer Profile"]
)
async def get_customer_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current customer's profile"""
    try:
        service = CustomerService(db)
        profile = service.get_customer_profile(UUID(current_user["id"]))
        return profile
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
    "/order-history",
    response_model=List[dict],
    tags=["Customer Profile"]
)
async def get_order_history(
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer's order history"""
    try:
        service = CustomerService(db)
        history = service.get_order_history(UUID(current_user["id"]), limit)
        return history
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


@router.post(
    "/redeem-points",
    response_model=dict,
    tags=["Loyalty Program"]
)
async def redeem_points(
    points: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Redeem loyalty points"""
    try:
        service = CustomerService(db)
        remaining_points = service.redeem_points(UUID(current_user["id"]), points)
        return {
            "message": f"{points} points redeemed successfully",
            "remaining_points": remaining_points
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
