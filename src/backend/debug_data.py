import asyncio
from app.db.session import AsyncSessionLocal
from app.models.models import TableRequest, RestaurantTable, Restaurant, User, Staff
from sqlalchemy import select
async def check():
    async with AsyncSessionLocal() as db:
        print("--- Users & Staff Roles ---")
        users = (await db.execute(select(User))).scalars().all()
        for u in users:
            print(f"User: {u.username}, Role: {u.role}, ID: {u.user_id}")
        staff_links = (await db.execute(select(Staff))).scalars().all()
        for s in staff_links:
            print(f"Staff: UserID {s.user_id} -> RestID {s.restaurant_id}")
        print("\n--- Restaurants ---")
        rests = (await db.execute(select(Restaurant))).scalars().all()
        for r in rests:
            print(f"Rest: {r.restaurant_id}, Name: {r.name}, Tenant: {r.tenant_id}")
        print("\n--- Tables ---")
        tables = (await db.execute(select(RestaurantTable))).scalars().all()
        for t in tables:
            print(f"Table: {t.table_id}, RestID: {t.restaurant_id}, Number: {t.table_number}")
        print("\n--- Table Requests ---")
        reqs = (await db.execute(select(TableRequest))).scalars().all()
        for r in reqs:
            print(f"Request: {r.request_id}, RestID: {r.restaurant_id}, TableID: {r.table_id}, Status: {r.status}, Type: {r.request_type}")
if __name__ == "__main__":
    asyncio.run(check())