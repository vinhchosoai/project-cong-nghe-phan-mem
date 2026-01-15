import uuid
from sqlalchemy import Column, String, Boolean, Time, Float, ForeignKey, Integer, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base, TimestampMixin
from app.schemas.enums import TableStatus

class Restaurant(Base, TimestampMixin):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String, nullable=False)
    phone_contact = Column(String, nullable=False)
    owner_email = Column(String, nullable=False)
    
    logo_url = Column(String, nullable=True)
    cover_image_url = Column(String, nullable=True)
    
    open_time = Column(Time, nullable=False)
    close_time = Column(Time, nullable=False)
    is_active = Column(Boolean, default=True)
    rating = Column(Float, default=0.0)

    staff_members = relationship("User", back_populates="restaurant")
    tables = relationship("Table", back_populates="restaurant", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="restaurant", cascade="all, delete-orphan")
    menu_items = relationship("MenuItem", back_populates="restaurant", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="restaurant")

class Table(Base, TimestampMixin):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id"), nullable=False)
    
    name = Column(String, nullable=False)
    capacity = Column(Integer, default=4)
    qr_code_url = Column(String, nullable=True)
    
    status = Column(SQLEnum(TableStatus), default=TableStatus.AVAILABLE, nullable=False)

    restaurant = relationship("Restaurant", back_populates="tables")
    orders = relationship("Order", back_populates="table")