from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import Restaurant, Staff, Category, MenuItem, RestaurantTable, Order
from app.core.context import get_tenant_id
from uuid import uuid4


class RestaurantService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_restaurant(self, name: str, address: str = None) -> Restaurant:
        tenant_id = get_tenant_id()
        restaurant = Restaurant(
            restaurant_id=f"rest-{uuid4().hex[:12]}",
            tenant_id=tenant_id,
            name=name,
            address=address,
            status=True,
        )
        self.db.add(restaurant)
        await self.db.commit()
        await self.db.refresh(restaurant)
        return restaurant

    async def get_restaurant(self, restaurant_id: str) -> Restaurant:
        tenant_id = get_tenant_id()
        result = await self.db.execute(
            select(Restaurant).where(
                (Restaurant.restaurant_id == restaurant_id) & 
                (Restaurant.tenant_id == tenant_id)
            )
        )
        return result.scalar_one_or_none()

    async def list_restaurants(self):
        tenant_id = get_tenant_id()
        result = await self.db.execute(
            select(Restaurant).where(Restaurant.tenant_id == tenant_id)
        )
        return result.scalars().all()

    async def update_restaurant(self, restaurant_id: str, **kwargs) -> Restaurant:
        restaurant = await self.get_restaurant(restaurant_id)
        if not restaurant:
            return None
        for key, value in kwargs.items():
            if hasattr(restaurant, key) and value is not None:
                setattr(restaurant, key, value)
        await self.db.commit()
        await self.db.refresh(restaurant)
        return restaurant

    async def delete_restaurant(self, restaurant_id: str) -> bool:
        restaurant = await self.get_restaurant(restaurant_id)
        if not restaurant:
            return False
        await self.db.delete(restaurant)
        await self.db.commit()
        return True


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_category(self, restaurant_id: str, name: str, display_index: int = 0) -> Category:
        category = Category(
            category_id=f"cat-{uuid4().hex[:12]}",
            restaurant_id=restaurant_id,
            name=name,
            display_index=display_index,
        )
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def get_category(self, category_id: str) -> Category:
        return await self.db.get(Category, category_id)

    async def list_categories(self, restaurant_id: str):
        result = await self.db.execute(
            select(Category).where(Category.restaurant_id == restaurant_id)
        )
        return result.scalars().all()

    async def update_category(self, category_id: str, **kwargs) -> Category:
        category = await self.get_category(category_id)
        if not category:
            return None
        for key, value in kwargs.items():
            if hasattr(category, key) and value is not None:
                setattr(category, key, value)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def delete_category(self, category_id: str) -> bool:
        category = await self.get_category(category_id)
        if not category:
            return False
        await self.db.delete(category)
        await self.db.commit()
        return True


class MenuItemService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_menu_item(self, category_id: str, name: str, price: float, 
                              description: str = None, image_url: str = None, 
                              is_available: bool = True, ai_tags: str = None) -> MenuItem:
        menu_item = MenuItem(
            item_id=f"item-{uuid4().hex[:12]}",
            category_id=category_id,
            name=name,
            description=description,
            price=price,
            image_url=image_url,
            is_available=is_available,
            ai_tags=ai_tags,
        )
        self.db.add(menu_item)
        await self.db.commit()
        await self.db.refresh(menu_item)
        return menu_item

    async def get_menu_item(self, item_id: str) -> MenuItem:
        return await self.db.get(MenuItem, item_id)

    async def list_menu_items(self, category_id: str):
        result = await self.db.execute(
            select(MenuItem).where(MenuItem.category_id == category_id)
        )
        return result.scalars().all()

    async def update_menu_item(self, item_id: str, **kwargs) -> MenuItem:
        menu_item = await self.get_menu_item(item_id)
        if not menu_item:
            return None
        for key, value in kwargs.items():
            if hasattr(menu_item, key) and value is not None:
                setattr(menu_item, key, value)
        await self.db.commit()
        await self.db.refresh(menu_item)
        return menu_item

    async def delete_menu_item(self, item_id: str) -> bool:
        menu_item = await self.get_menu_item(item_id)
        if not menu_item:
            return False
        await self.db.delete(menu_item)
        await self.db.commit()
        return True


class RestaurantTableService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_table(self, restaurant_id: str, table_number: int, qr_code_string: str = None) -> RestaurantTable:
        table_id = f"tbl-{uuid4().hex[:12]}"
        
        # Default QR code string if not provided
        if not qr_code_string:
            # TODO: Get base URL from settings
            base_url = "http://localhost:3000" 
            qr_code_string = f"{base_url}/menu/{restaurant_id}/{table_id}"

        table = RestaurantTable(
            table_id=table_id,
            restaurant_id=restaurant_id,
            table_number=table_number,
            qr_code_string=qr_code_string,
            status=True,
        )
        self.db.add(table)
        await self.db.commit()
        await self.db.refresh(table)
        return table

    async def get_table(self, table_id: str) -> RestaurantTable:
        return await self.db.get(RestaurantTable, table_id)

    async def list_tables(self, restaurant_id: str):
        result = await self.db.execute(
            select(RestaurantTable).where(RestaurantTable.restaurant_id == restaurant_id)
        )
        return result.scalars().all()

    async def update_table(self, table_id: str, **kwargs) -> RestaurantTable:
        table = await self.get_table(table_id)
        if not table:
            return None
        for key, value in kwargs.items():
            if hasattr(table, key) and value is not None:
                setattr(table, key, value)
        await self.db.commit()
        await self.db.refresh(table)
        return table

    async def delete_table(self, table_id: str) -> bool:
        table = await self.get_table(table_id)
        if not table:
            return False
        await self.db.delete(table)
        await self.db.commit()
        return True

    async def generate_qr_code_image(self, table_id: str) -> str:
        import qrcode
        from io import BytesIO
        import base64

        table = await self.get_table(table_id)
        if not table or not table.qr_code_string:
            return None

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(table.qr_code_string)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return img_str
