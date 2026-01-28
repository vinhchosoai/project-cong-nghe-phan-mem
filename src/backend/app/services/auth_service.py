from typing import Optional
from sqlalchemy.orm import Session
from app.crud.crud_user import user
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.exeptions import BusinessLogicException, UnauthorizedException, ResourceNotFoundException


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = user

    def register_user(self, user_in: UserCreate) -> UserResponse:
        """Register a new user"""
        # Check if user already exists
        existing_user = self.user_repo.get_by_email(self.db, user_in.email)
        if existing_user:
            raise BusinessLogicException(
                f"User with email {user_in.email} already exists"
            )

        # Create user with hashed password
        db_user = User(
            email=user_in.email,
            full_name=user_in.full_name,
            phone_number=user_in.phone_number,
            hashed_password=get_password_hash(user_in.password),
            role=user_in.role
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        return UserResponse.model_validate(db_user)

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        db_user = self.user_repo.get_by_email(self.db, email)
        if not db_user:
            return None
        
        if not verify_password(password, db_user.hashed_password):
            return None
        
        return db_user

    def login(self, email: str, password: str) -> dict:
        """Login user and return access token"""
        db_user = self.authenticate_user(email, password)
        if not db_user:
            raise UnauthorizedException("Invalid email or password")
        
        if not db_user.is_active:
            raise UnauthorizedException("User account is inactive")
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(db_user.id), "email": db_user.email, "role": db_user.role.value},
            tenant_id=str(db_user.restaurant_id) if db_user.restaurant_id else None
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(db_user)
        }

    def get_user(self, user_id: str) -> Optional[UserResponse]:
        """Get user by ID"""
        db_user = self.user_repo.get(self.db, user_id)
        if not db_user:
            return None
        return UserResponse.model_validate(db_user)
