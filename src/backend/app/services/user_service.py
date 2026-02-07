from sqlalchemy.ext.asyncio import AsyncSession
from ..repositories.user import UserRepository
from ..models.models import User
from ..core.exceptions import NotFoundException, ConflictException
from ..core.config import settings
import uuid
import bcrypt
from datetime import datetime, timedelta
import jwt
class UserService:
    def __init__(self, session: AsyncSession):
        self.repository = UserRepository(session)
    def hash_password(self, password: str) -> str:
        truncated_password = password.encode('utf-8')[:72]
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(truncated_password, salt)
        return hashed.decode('utf-8')
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        truncated_password = plain_password.encode('utf-8')[:72]
        return bcrypt.checkpw(truncated_password, hashed_password.encode('utf-8'))
    async def create_user(self, username: str, email: str, phone_number: str | None, password: str) -> User:
        existing_user = await self.repository.get_by_username(username)
        if existing_user:
            raise ConflictException(f"Username '{username}' already exists")
        existing_email = await self.repository.get_by_email(email)
        if existing_email:
            raise ConflictException(f"Email '{email}' already in use")
        hashed_password = self.hash_password(password)
        user_id = f"user-{uuid.uuid4().hex[:12]}"
        user_data = {
            "user_id": user_id,
            "username": username,
            "email": email,
            "phone_number": phone_number,
            "password_hash": hashed_password
        }
        new_user = await self.repository.create(user_data)
        return new_user
    async def get_user_by_id(self, user_id: str) -> User:
        user = await self.repository.get(user_id)
        if not user:
            raise NotFoundException(f"User with ID '{user_id}' not found")
        return user
    async def get_user_by_username(self, username: str) -> User:
        user = await self.repository.get_by_username(username)
        if not user:
            raise NotFoundException(f"User '{username}' not found")
        return user
    async def get_user_by_email(self, email: str) -> User:
        user = await self.repository.get_by_email(email)
        if not user:
            raise NotFoundException(f"User with email '{email}' not found")
        return user
    async def list_users(self, skip: int = 0, limit: int = 10) -> tuple[list[User], int]:
        users, total = await self.repository.get_all_users(skip, limit)
        return users, total
    async def search_users(self, search_term: str, skip: int = 0, limit: int = 10) -> tuple[list[User], int]:
        users, total = await self.repository.search_by_username(search_term, skip, limit)
        return users, total
    async def update_user(self, user_id: str, **kwargs) -> User:
        user = await self.get_user_by_id(user_id)
        update_data = {}
        if "email" in kwargs and kwargs["email"]:
            existing_email = await self.repository.get_by_email(kwargs["email"])
            if existing_email and existing_email.user_id != user_id:
                raise ConflictException(f"Email '{kwargs['email']}' already in use")
            update_data["email"] = kwargs["email"]
        if "phone_number" in kwargs:
            update_data["phone_number"] = kwargs["phone_number"]
        if "password" in kwargs and kwargs["password"]:
            update_data["password_hash"] = self.hash_password(kwargs["password"])
        if not update_data:
            return user
        updated_user = await self.repository.update_user(user_id, update_data)
        if not updated_user:
            raise NotFoundException(f"Failed to update user '{user_id}'")
        return updated_user
    async def delete_user(self, user_id: str) -> bool:
        user = await self.get_user_by_id(user_id)
        deleted = await self.repository.delete_user(user_id)
        if not deleted:
            raise NotFoundException(f"Failed to delete user '{user_id}'")
        return True
    async def authenticate_user(self, username: str, password: str) -> User:
        user = await self.repository.get_by_username(username)
        if not user or not self.verify_password(password, user.password_hash):
            raise NotFoundException("Invalid username or password")
        return user
    def get_access_token(self, user_id: str) -> str:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
        payload = {
            "sub": user_id,
            "exp": expire,
            "iat": datetime.utcnow()
        }
        encoded_jwt = jwt.encode(
            payload,
            settings.secret_key,
            algorithm=settings.algorithm
        )
        return encoded_jwt