import asyncio
import sys
import os
from pathlib import Path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))
from sqlalchemy import select
from app.db.session import AsyncSessionLocal, init_db
from app.models.models import User, Tenant, Restaurant, RestaurantTable, Category, MenuItem
from app.services.user_service import UserService
import uuid
from datetime import datetime
import qrcode
from io import BytesIO
import base64
async def seed_data():
    await init_db()
    async with AsyncSessionLocal() as db:
        user_service = UserService(db)
        admin_email = "admin@example.com"
        admin = await user_service.repository.get_by_email(admin_email)
        if not admin:
            print("Creating admin user...")
            hashed_pw = user_service.hash_password("Admin123!")
            admin = User(
                user_id=f"user-{uuid.uuid4().hex[:12]}",
                username="admin",
                email=admin_email,
                password_hash=hashed_pw,
                role="admin"
            )
            db.add(admin)
            await db.commit()
        owner_email = "restaurant@example.com"
        owner = await user_service.repository.get_by_email(owner_email)
        if not owner:
            print("Creating restaurant owner...")
            hashed_pw = user_service.hash_password("Restaurant123!")
            owner = User(
                user_id=f"user-{uuid.uuid4().hex[:12]}",
                username="restaurant_owner",
                email=owner_email,
                password_hash=hashed_pw,
                role="restaurant_owner"
            )
            db.add(owner)
            await db.commit()
        stmt = select(Tenant).where(Tenant.user_id == owner.user_id)
        result = await db.execute(stmt)
        tenant = result.scalar_one_or_none()
        if not tenant:
            print("Creating tenant...")
            tenant = Tenant(
                tenant_id=f"tenant-{uuid.uuid4().hex[:12]}",
                user_id=owner.user_id
            )
            db.add(tenant)
            await db.commit()
        stmt = select(Restaurant).where(Restaurant.tenant_id == tenant.tenant_id)
        result = await db.execute(stmt)
        restaurant = result.scalar_one_or_none()
        if not restaurant:
            print("Creating restaurant...")
            restaurant = Restaurant(
                restaurant_id=f"rest-{uuid.uuid4().hex[:12]}",
                tenant_id=tenant.tenant_id,
                name="S2O Demo Restaurant",
                address="123 Delicious Street"
            )
            db.add(restaurant)
            await db.commit()
            await db.refresh(restaurant)
        stmt = select(RestaurantTable).where(RestaurantTable.restaurant_id == restaurant.restaurant_id)
        result = await db.execute(stmt)
        tables = result.scalars().all()
        if not tables:
            print("Creating tables...")
            for i in range(1, 6):
                table_id = f"table-{uuid.uuid4().hex[:12]}"
                qr_content = f"http://localhost:3000/menu/{restaurant.restaurant_id}/{table_id}"
                table = RestaurantTable(
                    table_id=table_id,
                    restaurant_id=restaurant.restaurant_id,
                    table_number=i,
                    qr_code_string=qr_content,
                    status=True
                )
                db.add(table)
            await db.commit()
        stmt = select(Category).where(Category.restaurant_id == restaurant.restaurant_id)
        result = await db.execute(stmt)
        categories = result.scalars().all()
        if not categories:
            print("Creating menu categories and items...")
            cat_food = Category(
                category_id=f"cat-{uuid.uuid4().hex[:12]}",
                restaurant_id=restaurant.restaurant_id,
                name="Món Chính",
                display_index=1
            )
            db.add(cat_food)
            cat_drink = Category(
                category_id=f"cat-{uuid.uuid4().hex[:12]}",
                restaurant_id=restaurant.restaurant_id,
                name="Đồ Uống",
                display_index=2
            )
            db.add(cat_drink)
            await db.commit()
            item1 = MenuItem(
                item_id=f"item-{uuid.uuid4().hex[:12]}",
                category_id=cat_food.category_id,
                name="Phở Bò",
                description="Phở bò tái nạm",
                price=50000,
                is_available=True
            )
            item2 = MenuItem(
                item_id=f"item-{uuid.uuid4().hex[:12]}",
                category_id=cat_food.category_id,
                name="Cơm Rang",
                description="Cơm rang dưa bò",
                price=45000,
                is_available=True
            )
            item3 = MenuItem(
                item_id=f"item-{uuid.uuid4().hex[:12]}",
                category_id=cat_drink.category_id,
                name="Coca Cola",
                description="Lon 330ml",
                price=15000,
                is_available=True
            )
            db.add_all([item1, item2, item3])
            await db.commit()
    print("Seed data completed successfully.")
if __name__ == "__main__":
    asyncio.run(seed_data())