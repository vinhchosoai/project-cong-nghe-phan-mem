import uuid
from sqlalchemy import Column, Integer, ForeignKey, Float, String, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base, TimestampMixin
from app.schemas.enums import OrderStatus, PaymentMethod

class Order(Base, TimestampMixin):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) 
    table_id = Column(UUID(as_uuid=True), ForeignKey("tables.id"), nullable=True) 
    
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    total_amount = Column(Float, default=0.0)
    note = Column(Text, nullable=True)

    restaurant = relationship("Restaurant", back_populates="orders")
    user = relationship("User", back_populates="orders")
    table = relationship("Table", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False)

class OrderItem(Base, TimestampMixin):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(UUID(as_uuid=True), ForeignKey("menu_items.id"), nullable=False)
    
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False) 
    total_price = Column(Float, nullable=False)
    note = Column(Text, nullable=True)

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")

class Payment(Base, TimestampMixin):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    
    amount = Column(Float, nullable=False)
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    transaction_id = Column(String, nullable=True)
    status = Column(String, default="PENDING") 

    order = relationship("Order", back_populates="payment")