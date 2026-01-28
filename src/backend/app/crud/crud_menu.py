from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.crud.base import CRUDTenantBase
from app.models.menu import MenuItem, Category
from app.schemas.menu import MenuItemCreate, MenuItemUpdate, CategoryCreate

class CRUDMenuCategory(CRUDTenantBase[Category, CategoryCreate, CategoryCreate]):
    pass

class CRUDMenuItem(CRUDTenantBase[MenuItem, MenuItemCreate, MenuItemUpdate]):
    def get_by_category(
        self,
        db: Session,
        tenant_id: UUID,
        category_id: UUID
    ) -> List[MenuItem]:
        return db.query(self.model).filter(
            self.model.restaurant_id == tenant_id,
            self.model.category_id == category_id,
            self.model.is_available == True
        ).all()

menu_category = CRUDMenuCategory(Category, tenant_field="restaurant_id")
menu_item = CRUDMenuItem(MenuItem, tenant_field="restaurant_id")
