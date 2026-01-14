import uuid
from sqlalchemy import Column, String, Integer, Text, DECIMAL, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Order(Base):
    order_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(50), ForeignKey('tenants.tenant_id'), nullable=False)
    restaurant_id = Column(String(50), ForeignKey('restaurants.restaurant_id'), nullable=False)
    customer_id = Column(String(50), ForeignKey('customers.customer_id'))
    table_id = Column(String(50), ForeignKey('restaurant_tables.table_id'))
    status = Column(String(50), nullable=False)
    total_amount = Column(DECIMAL(19, 4), default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    restaurant = relationship("Restaurant", back_populates="orders")
    customer = relationship("Customer", back_populates="orders")
    table = relationship("RestaurantTable", back_populates="orders")
    order_details = relationship("OrderDetail", back_populates="order")
    invoice = relationship("Invoice", uselist=False, back_populates="order")

class OrderDetail(Base):
    order_detail_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(50), ForeignKey('tenants.tenant_id'), nullable=False)
    restaurant_id = Column(String(50), ForeignKey('restaurants.restaurant_id'), nullable=False)
    order_id = Column(String(50), ForeignKey('orders.order_id'), nullable=False)
    item_id = Column(String(50), ForeignKey('menu_items.item_id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(19, 4), nullable=False)
    note = Column(Text)

    order = relationship("Order", back_populates="order_details")
    item = relationship("MenuItem", back_populates="order_details")

class Invoice(Base):
    invoice_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(50), ForeignKey('tenants.tenant_id'), nullable=False)
    restaurant_id = Column(String(50), ForeignKey('restaurants.restaurant_id'), nullable=False)
    customer_id = Column(String(50), ForeignKey('customers.customer_id'))
    order_id = Column(String(50), ForeignKey('orders.order_id'), nullable=False)
    payment_method = Column(String(50))
    amount_paid = Column(DECIMAL(19, 4), nullable=False)
    payment_time = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="invoice")

class Revenue(Base):
    revenue_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(50), ForeignKey('tenants.tenant_id'), nullable=False)
    restaurant_id = Column(String(50), ForeignKey('restaurants.restaurant_id'), nullable=False)
    invoice_id = Column(String(50), ForeignKey('invoices.invoice_id'), nullable=False)
    report_date = Column(Date, nullable=False)
    total_revenue = Column(DECIMAL(19, 4), nullable=False)
    last_update = Column(DateTime(timezone=True), server_default=func.now())