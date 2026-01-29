from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.models import User
from .base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_username(self, username: str) -> User | None:
        query = select(User).filter(User.username == username)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_by_email(self, email: str) -> User | None:
        query = select(User).filter(User.email == email)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_all_users(self, skip: int = 0, limit: int = 10) -> tuple[list[User], int]:
        query = select(User).offset(skip).limit(limit)
        result = await self.session.execute(query)
        users = result.scalars().all()

        count_query = select(User)
        count_result = await self.session.execute(count_query)
        total = len(count_result.scalars().all())

        return users, total

    async def search_by_username(self, search_term: str, skip: int = 0, limit: int = 10) -> tuple[list[User], int]:
        query = select(User).filter(
            User.username.ilike(f"%{search_term}%")
        ).offset(skip).limit(limit)
        result = await self.session.execute(query)
        users = result.scalars().all()

        count_query = select(User).filter(User.username.ilike(f"%{search_term}%"))
        count_result = await self.session.execute(count_query)
        total = len(count_result.scalars().all())

        return users, total

    async def delete_user(self, user_id: str) -> bool:
        query = delete(User).where(User.user_id == user_id)
        result = await self.session.execute(query)
        await self.session.commit()
        return result.rowcount > 0

    async def update_user(self, user_id: str, update_data: dict) -> User | None:
        query = update(User).where(User.user_id == user_id).values(**update_data).returning(User)
        result = await self.session.execute(query)
        await self.session.commit()
        return result.scalars().first()
