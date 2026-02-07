from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.models import User
from .base import BaseRepository
class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, User)
    async def create(self, obj_in: dict) -> User:
        db_obj = User(**obj_in)
        self.db.add(db_obj)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj
    async def get(self, user_id: str) -> User | None:
        query = select(User).where(User.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalars().first()
    async def get_by_username(self, username: str) -> User | None:
        query = select(User).filter(User.username == username)
        result = await self.db.execute(query)
        return result.scalars().first()
    async def get_by_email(self, email: str) -> User | None:
        query = select(User).filter(User.email == email)
        result = await self.db.execute(query)
        return result.scalars().first()
    async def get_all_users(self, skip: int = 0, limit: int = 10) -> tuple[list[User], int]:
        query = select(User).offset(skip).limit(limit)
        result = await self.db.execute(query)
        users = result.scalars().all()
        count_query = select(User)
        count_result = await self.db.execute(count_query)
        total = len(count_result.scalars().all())
        return users, total
    async def search_by_username(self, search_term: str, skip: int = 0, limit: int = 10) -> tuple[list[User], int]:
        query = select(User).filter(
            User.username.ilike(f"%{search_term}%")
        ).offset(skip).limit(limit)
        result = await self.db.execute(query)
        users = result.scalars().all()
        count_query = select(User).filter(User.username.ilike(f"%{search_term}%"))
        count_result = await self.db.execute(count_query)
        total = len(count_result.scalars().all())
        return users, total
    async def delete_user(self, user_id: str) -> bool:
        user = await self.get(user_id)
        if not user:
            return False
        await self.db.delete(user)
        await self.db.commit()
        return True
    async def update_user(self, user_id: str, update_data: dict) -> User | None:
        query = update(User).where(User.user_id == user_id).values(**update_data).returning(User)
        result = await self.db.execute(query)
        await self.db.commit()
        return result.scalars().first()