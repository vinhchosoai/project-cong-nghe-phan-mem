import asyncio
import json
from app.db.session import AsyncSessionLocal
from app.models.models import User, Staff, Restaurant
from app.services.table_request_service import TableRequestService
from app.services.restaurant_service import RestaurantTableService
from app.services.order_service import OrderService
from sqlalchemy import select
async def simulate_dashboard(user_id):
    async with AsyncSessionLocal() as db:
        print(f"--- Simulating Dashboard for User ID: {user_id} ---")
        user = await db.get(User, user_id)
        if not user:
            print("User not found")
            return
        res_id = None
        if user.role in ['chef', 'waiter', 'manager', 'cashier', 'RESTAURANT_STAFF']:
            stmt = select(Staff).where(Staff.user_id == user.user_id)
            staff = (await db.execute(stmt)).scalar_one_or_none()
            if staff:
                res_id = staff.restaurant_id
        elif user.role == 'restaurant_owner':
            print("User is owner, restaurant_id might be missing in /auth/me")
            stmt = select(Restaurant).join(User, Restaurant.tenant_id.in_(select(Tenant.tenant_id).where(Tenant.user_id == user.user_id)))
            from app.models.models import Tenant
            stmt = select(Restaurant).join(Tenant).where(Tenant.user_id == user.user_id)
            res = (await db.execute(stmt)).scalars().first()
            if res:
                res_id = res.restaurant_id
        print(f"Resolved Restaurant ID: {res_id}")
        if not res_id:
            return
        try:
            print("\n--- Fetching Table Requests ---")
            table_service = TableRequestService(db)
            reqs = await table_service.get_restaurant_requests(res_id, status='pending')
            print(f"Found {len(reqs)} pending requests")
            for r in reqs:
                print(f" - Request {r.request_id}, Type {r.request_type}, Table {r.table.table_number if r.table else 'N/A'}")
        except Exception as e:
            print(f"Error fetching requests: {e}")
        try:
            print("\n--- Fetching Tables ---")
            rest_table_service = RestaurantTableService(db)
            tables = await rest_table_service.list_tables(res_id)
            print(f"Found {len(tables)} tables")
            for t in tables:
                print(f" - Table {t.table_number}, ID {t.table_id}")
        except Exception as e:
            print(f"Error fetching tables: {e}")
        try:
            print("\n--- Fetching Completed Orders ---")
            order_service = OrderService(db)
            orders = await order_service.get_restaurant_orders(res_id, status='COMPLETED')
            print(f"Found {len(orders)} completed orders")
        except Exception as e:
            print(f"Error fetching orders: {e}")
if __name__ == "__main__":
    asyncio.run(simulate_dashboard("user-0f9e65870cf8"))
    print("\n" + "="*50 + "\n")
    asyncio.run(simulate_dashboard("user-9117f665d89c"))