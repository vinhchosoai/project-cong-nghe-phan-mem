import asyncio
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import Restaurant
async def check_restaurants():
    async for db in get_db():
        try:
            result = await db.execute(select(Restaurant))
            restaurants = result.scalars().all()
            if restaurants:
                print(f"\nFound {len(restaurants)} restaurant(s):")
                for r in restaurants:
                    print(f"  - ID: {r.restaurant_id}")
                    print(f"    Name: {r.name}")
                    print(f"    Tenant: {r.tenant_id}")
                    print(f"    Status: {'Active' if r.status else 'Inactive'}")
                    print()
            else:
                print("\nNo restaurants found in the database.")
                print("You need to create a restaurant first!")
        finally:
            await db.close()
        break
if __name__ == "__main__":
    asyncio.run(check_restaurants())