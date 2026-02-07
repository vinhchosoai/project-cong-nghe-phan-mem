from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.repositories.table_request import TableRequestRepository
from app.models.models import TableRequest, RestaurantTable, Restaurant
from app.websockets.broadcaster import broadcaster
from app.core.context import set_tenant_id
import uuid
from typing import List
class TableRequestService:
    def __init__(self, db: AsyncSession):
        self.repo = TableRequestRepository(db)
        self.db = db
    async def create_request(self, restaurant_id: str, request_data: dict) -> TableRequest:
        table_id = request_data['table_id']
        table = await self.db.get(RestaurantTable, table_id)
        if not table and table_id.isdigit():
            stmt = select(RestaurantTable).where(
                RestaurantTable.restaurant_id == restaurant_id,
                RestaurantTable.table_number == int(table_id)
            )
            result = await self.db.execute(stmt)
            table = result.scalar_one_or_none()
        if not table:
            raise Exception("Invalid table")
        request_id = f"req-{uuid.uuid4().hex[:12]}"
        new_request = TableRequest(
            request_id=request_id,
            restaurant_id=restaurant_id,
            table_id=table.table_id,
            request_type=request_data['request_type'],
            status='pending'
        )
        self.db.add(new_request)
        await self.db.commit()
        await self.db.refresh(new_request)
        try:
            stmt = select(Restaurant.tenant_id).where(Restaurant.restaurant_id == restaurant_id)
            res = await self.db.execute(stmt)
            tenant_id = res.scalar()
            if tenant_id:
                set_tenant_id(tenant_id)
            await broadcaster.publish_table_request({
                "request_id": new_request.request_id,
                "restaurant_id": new_request.restaurant_id,
                "table_id": new_request.table_id,
                "table_number": table.table_number,
                "request_type": new_request.request_type,
                "status": new_request.status,
                "created_at": new_request.created_at.isoformat()
            })
        except Exception as e:
            print(f"Failed to broadcast table request: {e}")
        return new_request
    async def get_restaurant_requests(self, restaurant_id: str, status: str = None) -> List[TableRequest]:
        return await self.repo.get_by_restaurant(restaurant_id, status)
    async def update_status(self, request_id: str, new_status: str) -> TableRequest:
        request = await self.repo.get(request_id)
        if request:
            request.status = new_status
            await self.db.commit()
            await self.db.refresh(request)
        return request