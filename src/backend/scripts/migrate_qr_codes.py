import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import RestaurantTable
from app.core.config import settings
async def migrate_qr_codes():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session_maker() as session:
        result = await session.execute(select(RestaurantTable))
        tables = result.scalars().all()
        print(f"Found {len(tables)} tables to migrate")
        updated_count = 0
        skipped_count = 0
        for table in tables:
            if table.qr_code_string and "/menu/" in table.qr_code_string:
                base_url = "http://localhost:3000"
                new_qr_code = f"{base_url}/guest?restaurant_id={table.restaurant_id}&table_id={table.table_number}"
                print(f"Updating Table {table.table_number}:")
                print(f"  Old: {table.qr_code_string}")
                print(f"  New: {new_qr_code}")
                table.qr_code_string = new_qr_code
                updated_count += 1
            else:
                print(f"Skipping Table {table.table_number} (already in new format or no QR code)")
                skipped_count += 1
        await session.commit()
        print(f"\n✅ Migration complete!")
        print(f"   Updated: {updated_count} tables")
        print(f"   Skipped: {skipped_count} tables")
    await engine.dispose()
if __name__ == "__main__":
    print("Starting QR code migration...")
    print("This will update all existing table QR codes to the new format.\n")
    asyncio.run(migrate_qr_codes())