from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.restaurant_schemas import (
    RestaurantCreate, RestaurantUpdate, RestaurantResponse,
    CategoryCreate, CategoryUpdate, CategoryResponse,
    MenuItemCreate, MenuItemUpdate, MenuItemResponse,
    RestaurantTableCreate, RestaurantTableUpdate, RestaurantTableResponse
)
from app.services.restaurant_service import (
    RestaurantService, CategoryService, MenuItemService, RestaurantTableService
)

router = APIRouter(prefix="/api/v1", tags=["Restaurant Management"])


@router.post("/restaurants", response_model=RestaurantResponse)
async def create_restaurant(data: RestaurantCreate, db: AsyncSession = Depends(get_db)):
    try:
        service = RestaurantService(db)
        restaurant = await service.create_restaurant(data.name, data.address)
        return restaurant
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(restaurant_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = RestaurantService(db)
        restaurant = await service.get_restaurant(restaurant_id)
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        return restaurant
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/restaurants", response_model=list[RestaurantResponse])
async def list_restaurants(db: AsyncSession = Depends(get_db)):
    try:
        service = RestaurantService(db)
        restaurants = await service.list_restaurants()
        return restaurants
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(restaurant_id: str, data: RestaurantUpdate, db: AsyncSession = Depends(get_db)):
    try:
        service = RestaurantService(db)
        restaurant = await service.update_restaurant(restaurant_id, **data.dict(exclude_unset=True))
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        return restaurant
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/restaurants/{restaurant_id}")
async def delete_restaurant(restaurant_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = RestaurantService(db)
        success = await service.delete_restaurant(restaurant_id)
        if not success:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        return {"message": "Restaurant deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/restaurants/{restaurant_id}/categories", response_model=CategoryResponse)
async def create_category(restaurant_id: str, data: CategoryCreate, db: AsyncSession = Depends(get_db)):
    try:
        service = CategoryService(db)
        category = await service.create_category(
            restaurant_id=restaurant_id,
            name=data.name,
            display_index=data.display_index
        )
        return category
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/categories/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = CategoryService(db)
        category = await service.get_category(category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/restaurants/{restaurant_id}/categories", response_model=list[CategoryResponse])
async def list_categories(restaurant_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = CategoryService(db)
        categories = await service.list_categories(restaurant_id)
        return categories
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: str, data: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    try:
        service = CategoryService(db)
        category = await service.update_category(category_id, **data.dict(exclude_unset=True))
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/categories/{category_id}")
async def delete_category(category_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = CategoryService(db)
        success = await service.delete_category(category_id)
        if not success:
            raise HTTPException(status_code=404, detail="Category not found")
        return {"message": "Category deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/categories/{category_id}/items", response_model=MenuItemResponse)
async def create_menu_item(category_id: str, data: MenuItemCreate, db: AsyncSession = Depends(get_db)):
    try:
        service = MenuItemService(db)
        menu_item = await service.create_menu_item(
            category_id=category_id,
            name=data.name,
            price=data.price,
            description=data.description,
            image_url=data.image_url,
            is_available=data.is_available,
            ai_tags=data.ai_tags
        )
        return menu_item
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/menu-items/{item_id}", response_model=MenuItemResponse)
async def get_menu_item(item_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = MenuItemService(db)
        menu_item = await service.get_menu_item(item_id)
        if not menu_item:
            raise HTTPException(status_code=404, detail="Menu item not found")
        return menu_item
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/categories/{category_id}/items", response_model=list[MenuItemResponse])
async def list_menu_items(category_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = MenuItemService(db)
        items = await service.list_menu_items(category_id)
        return items
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/menu-items/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(item_id: str, data: MenuItemUpdate, db: AsyncSession = Depends(get_db)):
    try:
        service = MenuItemService(db)
        menu_item = await service.update_menu_item(item_id, **data.dict(exclude_unset=True))
        if not menu_item:
            raise HTTPException(status_code=404, detail="Menu item not found")
        return menu_item
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/menu-items/{item_id}")
async def delete_menu_item(item_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = MenuItemService(db)
        success = await service.delete_menu_item(item_id)
        if not success:
            raise HTTPException(status_code=404, detail="Menu item not found")
        return {"message": "Menu item deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/restaurants/{restaurant_id}/tables", response_model=RestaurantTableResponse)
async def create_table(restaurant_id: str, data: RestaurantTableCreate, db: AsyncSession = Depends(get_db)):
    try:
        service = RestaurantTableService(db)
        table = await service.create_table(
            restaurant_id=restaurant_id,
            table_number=data.table_number,
            qr_code_string=data.qr_code_string
        )
        return table
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/tables/{table_id}", response_model=RestaurantTableResponse)
async def get_table(table_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = RestaurantTableService(db)
        table = await service.get_table(table_id)
        if not table:
            raise HTTPException(status_code=404, detail="Table not found")
        return table
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/restaurants/{restaurant_id}/tables", response_model=list[RestaurantTableResponse])
async def list_tables(restaurant_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = RestaurantTableService(db)
        tables = await service.list_tables(restaurant_id)
        return tables
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/tables/{table_id}", response_model=RestaurantTableResponse)
async def update_table(table_id: str, data: RestaurantTableUpdate, db: AsyncSession = Depends(get_db)):
    try:
        service = RestaurantTableService(db)
        table = await service.update_table(table_id, **data.dict(exclude_unset=True))
        if not table:
            raise HTTPException(status_code=404, detail="Table not found")
        return table
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/tables/{table_id}")
async def delete_table(table_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = RestaurantTableService(db)
        success = await service.delete_table(table_id)
        if not success:
            raise HTTPException(status_code=404, detail="Table not found")
        return {"message": "Table deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
