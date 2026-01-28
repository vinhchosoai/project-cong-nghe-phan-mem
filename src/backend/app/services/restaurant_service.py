from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.crud.crud_restaurant import restaurant
from app.crud.crud_user import user
from app.models.restaurant import Restaurant, Table
from app.models.user import User
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate, RestaurantResponse
from app.schemas.enums import UserRole, TableStatus
from app.core.exeptions import BusinessLogicException, ResourceNotFoundException, ForbiddenException


class RestaurantService:
    def __init__(self, db: Session):
        self.db = db
        self.restaurant_repo = restaurant
        self.user_repo = user

    def create_restaurant(
        self,
        restaurant_in: RestaurantCreate,
        owner_id: UUID
    ) -> RestaurantResponse:
        """Create a new restaurant"""
        # Verify owner exists
        owner = self.user_repo.get(self.db, owner_id)
        if not owner:
            raise ResourceNotFoundException(f"User {owner_id} not found")

        # Create restaurant
        db_restaurant = Restaurant(
            **restaurant_in.model_dump(),
            id=UUID(int=0) if not hasattr(restaurant_in, 'id') else restaurant_in.id
        )
        self.db.add(db_restaurant)
        self.db.flush()

        # Update owner
        owner.restaurant_id = db_restaurant.id
        owner.role = UserRole.RESTAURANT_MANAGER

        self.db.commit()
        self.db.refresh(db_restaurant)
        
        return RestaurantResponse.model_validate(db_restaurant)

    def get_restaurant(self, restaurant_id: UUID) -> Optional[RestaurantResponse]:
        """Get restaurant by ID"""
        db_restaurant = self.restaurant_repo.get(self.db, restaurant_id)
        if not db_restaurant:
            return None
        return RestaurantResponse.model_validate(db_restaurant)

    def update_restaurant(
        self,
        restaurant_id: UUID,
        restaurant_in: RestaurantUpdate,
        user_id: UUID
    ) -> RestaurantResponse:
        """Update restaurant (only by manager)"""
        db_restaurant = self.restaurant_repo.get(self.db, restaurant_id)
        if not db_restaurant:
            raise ResourceNotFoundException(f"Restaurant {restaurant_id} not found")

        # Check permissions
        user_db = self.user_repo.get(self.db, user_id)
        if user_db.role not in [UserRole.ADMIN, UserRole.RESTAURANT_MANAGER]:
            raise ForbiddenException("Only managers can update restaurant")

        if user_db.role == UserRole.RESTAURANT_MANAGER and user_db.restaurant_id != restaurant_id:
            raise ForbiddenException("You can only update your own restaurant")

        updated_restaurant = self.restaurant_repo.update(
            self.db,
            db_obj=db_restaurant,
            obj_in=restaurant_in
        )
        return RestaurantResponse.model_validate(updated_restaurant)

    def get_all_restaurants(self, skip: int = 0, limit: int = 100) -> List[RestaurantResponse]:
        """Get all active restaurants"""
        restaurants = self.restaurant_repo.get_multi(
            self.db,
            skip=skip,
            limit=limit,
            is_active=True
        )
        return [RestaurantResponse.model_validate(r) for r in restaurants]

    def create_table(
        self,
        restaurant_id: UUID,
        table_name: str,
        capacity: int = 4
    ) -> Table:
        """Create a table for the restaurant"""
        db_restaurant = self.restaurant_repo.get(self.db, restaurant_id)
        if not db_restaurant:
            raise ResourceNotFoundException(f"Restaurant {restaurant_id} not found")

        db_table = Table(
            restaurant_id=restaurant_id,
            name=table_name,
            capacity=capacity,
            status=TableStatus.AVAILABLE
        )
        self.db.add(db_table)
        self.db.commit()
        self.db.refresh(db_table)
        
        return db_table

    def get_restaurant_tables(self, restaurant_id: UUID) -> List[Table]:
        """Get all tables for a restaurant"""
        db_restaurant = self.restaurant_repo.get(self.db, restaurant_id)
        if not db_restaurant:
            raise ResourceNotFoundException(f"Restaurant {restaurant_id} not found")
        
        return db_restaurant.tables
