import uuid
from sqlalchemy import Column, String, Boolean, Float, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base, TimestampMixin

class Category(Base, TimestampMixin):
    __tablename__ = "categories" # Override auto-name để xử lý số nhiều nếu cần, nhưng class Base của bạn đã xử lý tốt.

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id"), nullable=False)
    
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)

    restaurant = relationship("Restaurant", back_populates="categories")
    items = relationship("MenuItem", back_populates="category", cascade="all, delete-orphan")

class MenuItem(Base, TimestampMixin):
    __tablename__ = "menu_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    
    is_available = Column(Boolean, default=True)
    is_vegetarian = Column(Boolean, default=False)
    is_spicy = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)

    restaurant = relationship("Restaurant", back_populates="menu_items")
    category = relationship("Category", back_populates="items")
    order_items = relationship("OrderItem", back_populates="menu_item")