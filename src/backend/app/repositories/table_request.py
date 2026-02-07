from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import Optional
from ..models.models import TableRequest
from .base import BaseRepository
class TableRequestRepository(BaseRepository[TableRequest]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, TableRequest)
    async def get(self, request_id: str) -> Optional[TableRequest]:
        result = await self.db.execute(
            select(TableRequest).where(TableRequest.request_id == request_id)
        )
        return result.scalar_one_or_none()
    async def get_by_restaurant(self, restaurant_id: str, status: str = None) -> list[TableRequest]:
        query = select(TableRequest).where(TableRequest.restaurant_id == restaurant_id)
        if status:
            query = query.where(TableRequest.status == status)
        query = query.options(selectinload(TableRequest.table))
        query = query.order_by(TableRequest.created_at.desc())
        result = await self.db.execute(query)
        return result.scalars().all()