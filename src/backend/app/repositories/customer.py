from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.models import Customer
from .base import BaseRepository
class CustomerRepository(BaseRepository[Customer]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Customer)
    async def get_by_user_id(self, user_id: str) -> Customer | None:
        query = select(Customer).where(Customer.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalars().first()
    async def add_points(self, customer_id: str, points: int) -> Customer | None:
        query = (
            update(Customer)
            .where(Customer.customer_id == customer_id)
            .values(current_points=Customer.current_points + points)
            .returning(Customer)
        )
        result = await self.db.execute(query)
        await self.db.commit()
        return result.scalars().first()