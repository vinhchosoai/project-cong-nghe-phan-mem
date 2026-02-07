import asyncio
import sys
import os
import requests
import json
sys.path.append(os.getcwd())
from app.db.session import AsyncSessionLocal
from sqlalchemy import select
from app.models.models import Restaurant, Order
async def verify():
    print("Starting Kitchen View Refinement Verification...")
    async with AsyncSessionLocal() as db:
        stmt = select(Order).limit(1)
        order = (await db.execute(stmt)).scalars().first()
        if not order:
            print("No orders in DB to verify against.")
            return
        restaurant_id = order.restaurant_id
        tenant_id = order.tenant_id
        print(f"Testing with Restaurant: {restaurant_id}")
        url = f"http://localhost:8000/api/v1/orders/restaurant/{restaurant_id}?status=PENDING,PREPARING"
        headers = {
            "X-Tenant-ID": tenant_id
        }
        try:
            print(f"Calling API: {url}")
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"Orders Found: {len(data)}")
                if len(data) > 0:
                    first_order = data[0]
                    print(f"Sample Order ID: {first_order['order_id']}")
                    print(f"Table Number: {first_order.get('table_number')}")
                    if 'table_number' in first_order:
                        print("SUCCESS: table_number is present in response.")
                    else:
                        print("FAILURE: table_number is MISSING in response.")
                else:
                    print("WARNING: No orders returned.")
            else:
                print(f"FAILURE: API Error: {response.text}")
        except Exception as e:
            print(f"Request Failed: {e}")
if __name__ == "__main__":
    asyncio.run(verify())