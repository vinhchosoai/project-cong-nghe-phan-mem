import uuid
from sqlalchemy import Column, String, Integer, Boolean, Text, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Category(Base):
    __tablename__ = "categories"

    category_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(50), ForeignKey('restaurants.restaurant_id'), nullable=False)
    name = Column(String(100), nullable=False)
    display_index = Column(Integer, default=0)

    restaurant = relationship("Restaurant", back_populates="categories")
    menu_items = relationship("MenuItem", back_populates="category")

class MenuItem(Base):
    item_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id = Column(String(50), ForeignKey('categories.category_id'), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(DECIMAL(19, 4), nullable=False)
    image_url = Column(Text)
    is_available = Column(Boolean, default=True)
    ai_tags = Column(Text)

    category = relationship("Category", back_populates="menu_items")
    order_details = relationship("OrderDetail", back_populates="item")