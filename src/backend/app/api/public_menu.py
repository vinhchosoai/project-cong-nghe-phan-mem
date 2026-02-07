from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.models import Restaurant, Category, MenuItem, RestaurantTable, Order, OrderDetail
from app.schemas.restaurant_schemas import RestaurantResponse, CategoryResponse, MenuItemResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
router = APIRouter(prefix="/api/v1/public", tags=["Public Menu"])
class CartItem(BaseModel):
    item_id: str
    quantity: int
    note: Optional[str] = None
class OrderCreate(BaseModel):
    restaurant_id: str
    table_id: str
    items: List[CartItem]
class OrderResponse(BaseModel):
    order_id: str
    status: str
    total_amount: float
    created_at: datetime
    message: str
class CategoryWithItems(CategoryResponse):
    items: List[MenuItemResponse] = []
    class Config:
        from_attributes = True
class PublicOrderDetailResponse(BaseModel):
    item_name: str
    quantity: int
    unit_price: float
    class Config:
        from_attributes = True
class PublicOrderHistoryResponse(BaseModel):
    order_id: str
    status: str
    total_amount: float
    created_at: datetime
    order_details: List[PublicOrderDetailResponse]
    class Config:
        from_attributes = True
@router.get("/menu/{restaurant_id}", response_model=List[CategoryWithItems])
async def get_public_menu(restaurant_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Restaurant).where(Restaurant.restaurant_id == restaurant_id, Restaurant.status == True)
    result = await db.execute(stmt)
    restaurant = result.scalar_one_or_none()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    stmt = (
        select(Category)
        .where(Category.restaurant_id == restaurant_id)
        .options(selectinload(Category.menu_items))
        .order_by(Category.display_index)
    )
    result = await db.execute(stmt)
    categories = result.scalars().all()
    response = []
    for cat in categories:
        items = [
            item for item in cat.menu_items 
            if item.is_available
        ]
        cat_response = CategoryWithItems(
            category_id=cat.category_id,
            restaurant_id=cat.restaurant_id,
            name=cat.name,
            display_index=cat.display_index,
            items=items
        )
        response.append(cat_response)
    return response
@router.get("/menu/{restaurant_id}/items", response_model=List[MenuItemResponse])
async def get_public_menu_items(restaurant_id: str, category_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(MenuItem).join(Category).where(
        Category.restaurant_id == restaurant_id,
        MenuItem.is_available == True
    )
    if category_id:
        query = query.where(MenuItem.category_id == category_id)
    result = await db.execute(query)
    items = result.scalars().all()
    return items
@router.post("/orders/history", response_model=List[PublicOrderHistoryResponse])
async def get_orders_by_ids(order_ids: List[str], db: AsyncSession = Depends(get_db)):
    if not order_ids:
        return []
    order_ids = order_ids[:50]
    stmt = (
        select(Order)
        .where(Order.order_id.in_(order_ids))
        .options(
            selectinload(Order.order_details).selectinload(OrderDetail.menu_item)
        )
        .order_by(Order.created_at.desc())
    )
    result = await db.execute(stmt)
    orders = result.scalars().all()
    response = []
    for order in orders:
        details = []
        for d in order.order_details:
            details.append(PublicOrderDetailResponse(
                item_name=d.menu_item.name if d.menu_item else "Unknown",
                quantity=d.quantity,
                unit_price=float(d.unit_price)
            ))
        response.append(PublicOrderHistoryResponse(
            order_id=order.order_id,
            status=order.status,
            total_amount=float(order.total_amount),
            created_at=order.created_at,
            order_details=details
        ))
    return response
from app.websockets.broadcaster import broadcaster
from app.core.context import set_tenant_id
from app.core.security import get_current_user_optional
from app.models.models import User
from app.repositories.customer import CustomerRepository
@router.post("/orders", response_model=OrderResponse)
async def submit_order(order_data: OrderCreate, db: AsyncSession = Depends(get_db), current_user: User | None = Depends(get_current_user_optional)):
    table = await db.get(RestaurantTable, order_data.table_id)
    if not table and order_data.table_id.isdigit():
        stmt = select(RestaurantTable).where(
            RestaurantTable.restaurant_id == order_data.restaurant_id,
            RestaurantTable.table_number == int(order_data.table_id)
        )
        result = await db.execute(stmt)
        table = result.scalar_one_or_none()
    if not table or table.restaurant_id != order_data.restaurant_id:
        raise HTTPException(status_code=400, detail="Invalid table or restaurant")
    total_amount = 0
    order_id = f"ord-{uuid.uuid4().hex[:12]}"
    restaurant = await db.get(Restaurant, order_data.restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    tenant_id = restaurant.tenant_id
    set_tenant_id(tenant_id)
    customer_id = None
    if current_user:
        customer_repo = CustomerRepository(db)
        customer = await customer_repo.get_by_user_id(current_user.user_id)
        if customer:
            customer_id = customer.customer_id
    new_order = Order(
        order_id=order_id,
        tenant_id=tenant_id,
        restaurant_id=order_data.restaurant_id,
        customer_id=customer_id,
        table_id=table.table_id,
        status="PENDING",
        total_amount=0,
        created_at=datetime.utcnow()
    )
    db.add(new_order)
    for item in order_data.items:
        menu_item = await db.get(MenuItem, item.item_id)
        if not menu_item:
            continue
        amount = menu_item.price * item.quantity
        total_amount += amount
        detail = OrderDetail(
            order_detail_id=f"od-{uuid.uuid4().hex[:12]}",
            tenant_id=tenant_id,
            restaurant_id=order_data.restaurant_id,
            order_id=order_id,
            item_id=item.item_id,
            quantity=item.quantity,
            unit_price=menu_item.price,
            note=item.note
        )
        db.add(detail)
    new_order.total_amount = total_amount
    await db.commit()
    try:
        await broadcaster.publish_order_created({
            "order_id": new_order.order_id,
            "restaurant_id": new_order.restaurant_id,
            "status": new_order.status,
            "total_amount": str(new_order.total_amount),
            "created_at": new_order.created_at.isoformat(),
            "table_id": new_order.table_id
        })
    except Exception as e:
        print(f"Failed to broadcast order creation: {e}")
    return OrderResponse(
        order_id=order_id,
        status="PENDING",
        total_amount=float(total_amount),
        created_at=new_order.created_at,
        message="Order successfully"
    )