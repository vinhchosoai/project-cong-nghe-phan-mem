from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.repositories.base import BaseRepository
from app.models.models import Order, OrderDetail
from app.core.context import get_tenant_id
from typing import List, Optional
from sqlalchemy.orm import selectinload
class OrderRepository(BaseRepository[Order]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Order)
    async def get_by_id(self, order_id: str) -> Optional[Order]:
        tenant_id = self._get_tenant_id()
        query = select(Order).where(
            Order.order_id == order_id,
            Order.tenant_id == tenant_id
        ).options(selectinload(Order.order_details).selectinload(OrderDetail.menu_item))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    async def get_by_restaurant(self, restaurant_id: str, skip: int = 0, limit: int = 100, status_list: Optional[List[str]] = None) -> List[Order]:
        query = select(Order).where(
            Order.restaurant_id == restaurant_id
        ).options(
            selectinload(Order.order_details).selectinload(OrderDetail.menu_item),
            selectinload(Order.table)
        )
        if status_list:
            query = query.where(Order.status.in_(status_list))
        query = query.offset(skip).limit(limit).order_by(Order.created_at.desc())
        result = await self.db.execute(query)
        orders = result.scalars().all()
        return orders
    async def get_by_customer(self, customer_id: str, skip: int = 0, limit: int = 100) -> List[Order]:
        tenant_id = self._get_tenant_id()
        query = select(Order).where(
            Order.customer_id == customer_id,
            Order.tenant_id == tenant_id
        ).options(
            selectinload(Order.order_details).selectinload(OrderDetail.menu_item),
            selectinload(Order.table)
        ).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()
    async def get_by_status(self, status: str, skip: int = 0, limit: int = 100) -> List[Order]:
        tenant_id = self._get_tenant_id()
        query = select(Order).where(
            Order.status == status,
            Order.tenant_id == tenant_id
        ).options(
            selectinload(Order.order_details).selectinload(OrderDetail.menu_item),
            selectinload(Order.table)
        ).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()
    async def update(self, id: str, obj_in: dict) -> Order:
        tenant_id = self._get_tenant_id()
        from sqlalchemy import update as sqlalchemy_update
        query = sqlalchemy_update(Order).where(
            Order.order_id == id,
            Order.tenant_id == tenant_id
        ).values(**obj_in)
        await self.db.execute(query)
        await self.db.commit()
        return await self.get_by_id(id)
    async def create_order(self, order_data: dict, order_details: List[dict]) -> Order:
        tenant_id = self._get_tenant_id()
        order_data['tenant_id'] = tenant_id
        order = Order(**order_data)
        self.db.add(order)
        await self.db.flush()
        for detail in order_details:
            detail['tenant_id'] = tenant_id
            detail_obj = OrderDetail(**detail)
            self.db.add(detail_obj)
        await self.db.commit()
        await self.db.refresh(order)
        return order
class OrderDetailRepository(BaseRepository[OrderDetail]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, OrderDetail)
    async def get_by_order(self, order_id: str) -> List[OrderDetail]:
        tenant_id = self._get_tenant_id()
        query = select(OrderDetail).where(
            OrderDetail.order_id == order_id,
            OrderDetail.tenant_id == tenant_id
        )
        result = await self.db.execute(query)
        return result.scalars().all()