from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.table_request_service import TableRequestService
from app.models.models import User, TableRequest
from app.core.security import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
router = APIRouter(prefix="/api/v1/table-requests", tags=["Table Requests"])
class TableRequestCreate(BaseModel):
    table_id: str
    request_type: str
class TableRequestUpdate(BaseModel):
    status: str
class TableRequestResponse(BaseModel):
    request_id: str
    restaurant_id: str
    table_id: str
    table_number: Optional[int]
    request_type: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True
@router.post("/{restaurant_id}", response_model=TableRequestResponse)
async def create_request(
    restaurant_id: str,
    request_data: TableRequestCreate,
    db: AsyncSession = Depends(get_db)
):
    service = TableRequestService(db)
    try:
        new_req = await service.create_request(restaurant_id, request_data.dict())
        return TableRequestResponse(
            request_id=new_req.request_id,
            restaurant_id=new_req.restaurant_id,
            table_id=new_req.table_id,
            table_number=None,
            request_type=new_req.request_type,
            status=new_req.status,
            created_at=new_req.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/{restaurant_id}", response_model=List[TableRequestResponse])
async def get_requests(
    restaurant_id: str,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ['restaurant_owner', 'manager', 'chef', 'cashier']:
         raise HTTPException(status_code=403, detail="Not authorized")
    service = TableRequestService(db)
    requests = await service.get_restaurant_requests(restaurant_id, status)
    return [
        TableRequestResponse(
            request_id=r.request_id,
            restaurant_id=r.restaurant_id,
            table_id=r.table_id,
            table_number=r.table.table_number if r.table else None,
            request_type=r.request_type,
            status=r.status,
            created_at=r.created_at
        ) for r in requests
    ]
@router.put("/{request_id}", response_model=TableRequestResponse)
async def update_request(
    request_id: str,
    data: TableRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ['restaurant_owner', 'manager', 'chef', 'cashier']:
         raise HTTPException(status_code=403, detail="Not authorized")
    service = TableRequestService(db)
    updated_req = await service.update_status(request_id, data.status)
    if not updated_req:
        raise HTTPException(status_code=404, detail="Request not found")
    return TableRequestResponse(
        request_id=updated_req.request_id,
        restaurant_id=updated_req.restaurant_id,
        table_id=updated_req.table_id,
        table_number=updated_req.table.table_number if updated_req.table else None,
        request_type=updated_req.request_type,
        status=updated_req.status,
        created_at=updated_req.created_at
    )