import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
async def migrate():
    engine = create_async_engine(settings.database_url)
    try:
        async with engine.begin() as conn:
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer'"))
        print('✅ Successfully added role column to users table')
    except Exception as e:
        print(f'Error: {e}')
    finally:
        await engine.dispose()
if __name__ == '__main__':
    asyncio.run(migrate())