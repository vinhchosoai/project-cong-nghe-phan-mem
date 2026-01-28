from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(self.model).filter(self.model.email == email).first()
    
    def get_staff_by_restaurant(
        self,
        db: Session,
        restaurant_id: UUID
    ) -> List[User]:
        return db.query(self.model).filter(
            self.model.restaurant_id == restaurant_id,
            self.model.is_active == True
        ).all()

user = CRUDUser(User)
