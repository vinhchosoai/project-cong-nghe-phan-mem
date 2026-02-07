from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from typing import TypeVar, Generic, Optional, List, Type
from app.core.context import get_tenant_id
from app.core.exceptions import NotFoundException
T = TypeVar('T')
class BaseRepository(Generic[T]):
    def __init__(self, db: AsyncSession, model: Type[T]):
        self.db = db
        self.model = model
    def _get_tenant_id(self) -> str:
        tenant_id = get_tenant_id()
        if not tenant_id:
            raise ValueError("Tenant ID not set in context")
        return tenant_id
    async def create(self, obj_in: dict) -> T:
        if hasattr(self.model, 'tenant_id'):
            obj_in['tenant_id'] = self._get_tenant_id()
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj
    async def get(self, id: str) -> Optional[T]:
        tenant_id = self._get_tenant_id()
        query = select(self.model).where(
            self.model.id == id,
            self.model.tenant_id == tenant_id
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        tenant_id = self._get_tenant_id()
        query = select(self.model).where(
            self.model.tenant_id == tenant_id
        ).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()
    async def update(self, id: str, obj_in: dict) -> T:
        tenant_id = self._get_tenant_id()
        query = update(self.model).where(
            self.model.id == id,
            self.model.tenant_id == tenant_id
        ).values(**obj_in).returning(self.model)
        result = await self.db.execute(query)
        await self.db.commit()
        return result.scalar_one_or_none()
    async def delete(self, id: str) -> bool:
        tenant_id = self._get_tenant_id()
        query = delete(self.model).where(
            self.model.id == id,
            self.model.tenant_id == tenant_id
        )
        result = await self.db.execute(query)
        await self.db.commit()
        return result.rowcount > 0
    async def execute_query(self, query):
        tenant_id = self._get_tenant_id()
        if hasattr(self.model, 'tenant_id'):
            query = query.where(self.model.tenant_id == tenant_id)
        result = await self.db.execute(query)
        return result