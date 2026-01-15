import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base, TimestampMixin
from app.schemas.enums import UserRole, MembershipTier

class User(Base, TimestampMixin):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    membership_tier = Column(SQLEnum(MembershipTier), default=MembershipTier.IRON, nullable=False)
    points = Column(Integer, default=0)

    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id"), nullable=True)

    restaurant = relationship("Restaurant", back_populates="staff_members")
    orders = relationship("Order", back_populates="user")