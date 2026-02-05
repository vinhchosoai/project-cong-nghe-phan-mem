from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.order import OrderRepository
from app.core.exceptions import NotFoundException
from typing import List, Optional


class OrderService:
    def __init__(self, db: AsyncSession):
        self.order_repo = OrderRepository(db)
        self.db = db

    async def create_order(self, order_data: dict, order_details: List[dict]):
        order = await self.order_repo.create_order(order_data, order_details)
        return order

    async def get_order(self, order_id: str):
        order = await self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")
        return order

    async def get_restaurant_orders(self, restaurant_id: str, skip: int = 0, limit: int = 100, status: Optional[str] = None):
        status_list = None
        if status:
            status_list = [s.strip() for s in status.split(',')]
            
        orders = await self.order_repo.get_by_restaurant(restaurant_id, skip, limit, status_list)
        return orders

    async def get_customer_orders(self, customer_id: str, skip: int = 0, limit: int = 100):
        orders = await self.order_repo.get_by_customer(customer_id, skip, limit)
        return orders

    async def get_orders_by_status(self, status: str, skip: int = 0, limit: int = 100):
        orders = await self.order_repo.get_by_status(status, skip, limit)
        return orders

    async def update_order_status(self, order_id: str, status: str):
        order = await self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")
        updated_order = await self.order_repo.update(order_id, {"status": status})
        return updated_order

    async def delete_order(self, order_id: str):
        order = await self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")
        await self.order_repo.delete(order_id)
        return True
