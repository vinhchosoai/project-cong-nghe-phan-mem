from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from ..models.models import Staff
from .base import BaseRepository
class StaffRepository(BaseRepository[Staff]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Staff)
    async def get_by_restaurant(self, restaurant_id: str) -> list[Staff]:
        query = select(Staff).where(Staff.restaurant_id == restaurant_id).options(selectinload(Staff.user))
        result = await self.db.execute(query)
        return result.scalars().all()
    async def get(self, id: str) -> Staff | None:
        query = select(Staff).where(Staff.staff_id == id).options(selectinload(Staff.user))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    async def delete(self, id: str) -> bool:
        query = select(Staff).where(Staff.staff_id == id)
        result = await self.db.execute(query)
        staff = result.scalar_one_or_none()
        if staff:
            await self.db.delete(staff)
            await self.db.commit()
            return True
        return False
    async def get_by_user(self, user_id: str) -> Staff | None:
        query = select(Staff).where(Staff.user_id == user_id).options(selectinload(Staff.user))
        result = await self.db.execute(query)
        return result.scalars().first()