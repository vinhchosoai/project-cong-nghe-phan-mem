from typing import Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.restaurant import Restaurant
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate

class CRUDRestaurant(CRUDBase[Restaurant, RestaurantCreate, RestaurantUpdate]):
    def get_by_owner(self, db: Session, owner_email: str) -> Optional[Restaurant]:
        return db.query(self.model).filter(self.model.owner_email == owner_email).first()

restaurant = CRUDRestaurant(Restaurant)