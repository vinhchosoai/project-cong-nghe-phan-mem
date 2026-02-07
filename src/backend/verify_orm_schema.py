import asyncio
import sys
import os
from sqlalchemy import select
from sqlalchemy.orm import selectinload
sys.path.append(os.getcwd())
from app.db.session import AsyncSessionLocal
from app.models.models import Order
from app.schemas.schemas import OrderResponse
async def verify():
    print("Starting Direct ORM & Schema Verification...")
    async with AsyncSessionLocal() as db:
        stmt = select(Order).options(
            selectinload(Order.table),
            selectinload(Order.order_details)
        ).limit(1)
        result = await db.execute(stmt)
        order = result.scalars().first()
        if not order:
            print("No orders found in DB.")
            return
        print(f"Order ID: {order.order_id}")
        try:
            table_num = order.table_number
            print(f"ORM Property table_number: {table_num}")
        except Exception as e:
            print(f"ORM Property Access Failed: {e}")
        try:
            serialized = OrderResponse.from_orm(order)
            print(f"Serialized table_number: {serialized.table_number}")
            if serialized.table_number is not None:
                print("SUCCESS: table_number serialized correctly.")
            else:
                print("FAILURE: table_number is None in schema output.")
        except Exception as e:
            print(f"Serialization Failed: {e}")
if __name__ == "__main__":
    asyncio.run(verify())