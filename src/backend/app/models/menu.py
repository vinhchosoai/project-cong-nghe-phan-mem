from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, Text, Numeric
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Category(Base):
    __tablename__ = "Category"

    categoryID = Column(String(50), primary_key=True)
    restaurantID = Column(String(50), ForeignKey("Restaurant.restaurantID"), nullable=False)
    name = Column(String(100), nullable=False)
    displayIndex = Column(Integer, default=0)

    restaurant = relationship("Restaurant", back_populates="categories")
    menu_items = relationship("MenuItem", back_populates="category")

class MenuItem(Base):
    __tablename__ = "MenuItem"

    itemID = Column(String(50), primary_key=True)
    categoryID = Column(String(50), ForeignKey("Category.categoryID"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Numeric(19, 4), nullable=False) 
    imageURL = Column(Text)
    isAvailable = Column(Boolean, default=True)
    aiTags = Column(Text)

    category = relationship("Category", back_populates="menu_items")