from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.staff import StaffRepository
from app.repositories.user import UserRepository
from app.models.models import User, Staff
from app.core.exceptions import NotFoundException, ValidationException, ConflictException
from app.core.security import get_password_hash
from app.services.restaurant_service import RestaurantService
import uuid
from typing import List
class StaffService:
    def __init__(self, db: AsyncSession):
        self.staff_repo = StaffRepository(db)
        self.user_repo = UserRepository(db)
        self.restaurant_service = RestaurantService(db)
        self.db = db
    async def create_staff(self, restaurant_id: str, staff_data: dict) -> Staff:
        restaurant = await self.restaurant_service.get_restaurant(restaurant_id)
        if not restaurant:
            raise NotFoundException(f"Restaurant with ID {restaurant_id} not found")
        existing_user = await self.user_repo.get_by_email(staff_data['email'])
        if existing_user:
            raise ConflictException("User with this email already exists")
        user_id = f"user-{uuid.uuid4().hex[:12]}"
        new_user = User(
            user_id=user_id,
            username=staff_data['username'],
            email=staff_data['email'],
            password_hash=get_password_hash(staff_data['password']),
            role=staff_data['role']
        )
        self.db.add(new_user)
        staff_id = f"staff-{uuid.uuid4().hex[:12]}"
        new_staff = Staff(
            staff_id=staff_id,
            restaurant_id=restaurant_id,
            user_id=user_id,
            role=staff_data['role']
        )
        self.db.add(new_staff)
        await self.db.commit()
        await self.db.refresh(new_staff)
        return new_staff
    async def get_restaurant_staff(self, restaurant_id: str) -> List[Staff]:
        return await self.staff_repo.get_by_restaurant(restaurant_id)
    async def update_staff_role(self, staff_id: str, new_role: str) -> Staff:
        staff = await self.staff_repo.get(staff_id)
        if not staff:
            raise NotFoundException("Staff not found")
        staff.role = new_role
        user = await self.user_repo.get(staff.user_id)
        if user:
            user.role = new_role
            self.db.add(user)
        await self.db.commit()
        await self.db.refresh(staff)
        return staff
    async def remove_staff(self, staff_id: str):
        staff = await self.staff_repo.get(staff_id)
        if not staff:
            raise NotFoundException("Staff not found")
        await self.staff_repo.delete(staff_id)
        await self.user_repo.delete_user(staff.user_id)
        return True