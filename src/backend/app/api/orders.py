from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.schemas import OrderCreate, OrderUpdate, OrderResponse
from app.services.order_service import OrderService
from app.websockets.broadcaster import broadcaster
from app.core.context import get_tenant_id
from typing import List
from app.core.security import get_current_user
from app.models.models import User
from app.repositories.customer import CustomerRepository
router = APIRouter(prefix="/orders", tags=["Orders"])
@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate, db: AsyncSession = Depends(get_db)):
    service = OrderService(db)
    tenant_id = get_tenant_id()
    order_data = {
        "restaurant_id": order.restaurant_id,
        "customer_id": order.customer_id,
        "table_id": order.table_id,
        "status": order.status,
        "total_amount": order.total_amount,
    }
    order_details = [
        {
            "item_id": detail.item_id,
            "quantity": detail.quantity,
            "unit_price": detail.unit_price,
            "note": detail.note,
            "restaurant_id": order.restaurant_id,
        }
        for detail in order.order_details
    ]
    created_order = await service.create_order(order_data, order_details)
    await broadcaster.publish_order_created({
        "order_id": created_order.order_id,
        "restaurant_id": created_order.restaurant_id,
        "status": created_order.status,
        "total_amount": str(created_order.total_amount),
        "created_at": created_order.created_at.isoformat(),
    })
    return created_order
@router.get("/my-orders", response_model=List[OrderResponse])
async def get_my_orders(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "customer":
        return []
    customer_repo = CustomerRepository(db)
    customer = await customer_repo.get_by_user_id(current_user.user_id)
    if not customer:
        return []
    service = OrderService(db)
    orders = await service.get_customer_orders(customer.customer_id, skip, limit)
    return orders
@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, db: AsyncSession = Depends(get_db)):
    service = OrderService(db)
    order = await service.get_order(order_id)
    return order
@router.get("/restaurant/{restaurant_id}", response_model=List[OrderResponse])
async def get_restaurant_orders(
    restaurant_id: str, 
    skip: int = 0, 
    limit: int = 100, 
    status: str = None,
    db: AsyncSession = Depends(get_db)
):
    service = OrderService(db)
    orders = await service.get_restaurant_orders(restaurant_id, skip, limit, status)
    return orders
@router.get("/customer/{customer_id}", response_model=List[OrderResponse])
async def get_customer_orders(customer_id: str, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    service = OrderService(db)
    orders = await service.get_customer_orders(customer_id, skip, limit)
    return orders
@router.get("/status/{status}", response_model=List[OrderResponse])
async def get_orders_by_status(status: str, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    service = OrderService(db)
    orders = await service.get_orders_by_status(status, skip, limit)
    return orders
@router.patch("/{order_id}", response_model=OrderResponse)
async def update_order(order_id: str, order_update: OrderUpdate, db: AsyncSession = Depends(get_db)):
    service = OrderService(db)
    update_data = order_update.model_dump(exclude_unset=True)
    updated_order = await service.update_order_status(order_id, update_data.get("status"))
    if "status" in update_data:
        await broadcaster.publish_order_status_changed(order_id, update_data["status"])
    return updated_order
@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(order_id: str, db: AsyncSession = Depends(get_db)):
    service = OrderService(db)
    await service.delete_order(order_id)
    return None