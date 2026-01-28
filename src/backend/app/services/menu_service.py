from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.crud.crud_menu import menu_item, menu_category
from app.models.menu import MenuItem
from app.schemas.menu import MenuItemCreate, MenuItemUpdate
from app.core.exeptions import BusinessLogicException, ResourceNotFoundException


class MenuService:
    def __init__(self, db: Session):
        self.db = db
        self.menu_repo = menu_item
        self.category_repo = menu_category

    def create_menu_item(
        self,
        restaurant_id: UUID,
        item_in: MenuItemCreate
    ) -> MenuItem:
        """Create a new menu item with validation"""
        if item_in.price < 0:
            raise BusinessLogicException("Price cannot be negative")
        
        item_data = item_in.model_dump()
        item_data["restaurant_id"] = restaurant_id
        
        db_item = self.menu_repo.create(self.db, obj_in=item_in)
        return db_item

    def get_menu_item(
        self,
        restaurant_id: UUID,
        item_id: UUID
    ) -> Optional[MenuItem]:
        """Get a specific menu item"""
        return self.menu_repo.get_by_tenant(
            self.db,
            tenant_id=restaurant_id,
            id=item_id
        )

    def get_restaurant_menu(
        self,
        restaurant_id: UUID
    ) -> List[MenuItem]:
        """Get all menu items for a restaurant"""
        return self.menu_repo.get_multi_by_tenant(
            self.db,
            tenant_id=restaurant_id,
            is_available=True
        )

    def get_menu_by_category(
        self,
        restaurant_id: UUID,
        category_id: UUID
    ) -> List[MenuItem]:
        """Get menu items filtered by category"""
        return self.menu_repo.get_by_category(
            self.db,
            tenant_id=restaurant_id,
            category_id=category_id
        )

    def update_menu_item(
        self,
        restaurant_id: UUID,
        item_id: UUID,
        item_in: MenuItemUpdate
    ) -> MenuItem:
        """Update a menu item"""
        db_item = self.get_menu_item(restaurant_id, item_id)
        if not db_item:
            raise ResourceNotFoundException(f"Menu item {item_id} not found")
        
        if item_in.price is not None and item_in.price < 0:
            raise BusinessLogicException("Price cannot be negative")
        
        updated_item = self.menu_repo.update(
            self.db,
            db_obj=db_item,
            obj_in=item_in
        )
        return updated_item

    def delete_menu_item(
        self,
        restaurant_id: UUID,
        item_id: UUID
    ) -> MenuItem:
        """Delete a menu item"""
        db_item = self.get_menu_item(restaurant_id, item_id)
        if not db_item:
            raise ResourceNotFoundException(f"Menu item {item_id} not found")
        
        return self.menu_repo.delete(self.db, id=item_id)

    def toggle_availability(
        self,
        restaurant_id: UUID,
        item_id: UUID,
        is_available: bool
    ) -> MenuItem:
        """Toggle menu item availability"""
        db_item = self.get_menu_item(restaurant_id, item_id)
        if not db_item:
            raise ResourceNotFoundException(f"Menu item {item_id} not found")
        
        return self.menu_repo.update(
            self.db,
            db_obj=db_item,
            obj_in=MenuItemUpdate(is_available=is_available)
        )
