import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class User(Base):
    user_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    phone_number = Column(String(20))
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tenants = relationship("Tenant", back_populates="owner")
    staff_roles = relationship("Staff", back_populates="user")
    customers = relationship("Customer", back_populates="user")

class Tenant(Base):
    tenant_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(50), ForeignKey('users.user_id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="tenants")
    restaurants = relationship("Restaurant", back_populates="tenant")

class Customer(Base):
    customer_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(50), ForeignKey('users.user_id'), nullable=False)
    membership_tier = Column(String(50))
    current_points = Column(String(50), default="0")
    password_hash = Column(String(255))

    user = relationship("User", back_populates="customers")
    orders = relationship("Order", back_populates="customer")
    reservations = relationship("Reservation", back_populates="customer")

class Staff(Base):
    __tablename__ = "staff" 
    
    staff_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(50), ForeignKey('restaurants.restaurant_id'), nullable=False)
    user_id = Column(String(50), ForeignKey('users.user_id'), nullable=False)
    role = Column(String(50), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    restaurant = relationship("Restaurant", back_populates="staff_members")
    user = relationship("User", back_populates="staff_roles")   