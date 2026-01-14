import uuid
from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Restaurant(Base):
    restaurant_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(50), ForeignKey('tenants.tenant_id'), nullable=False)
    name = Column(String(255), nullable=False)
    address = Column(String(255))
    status = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tenant = relationship("Tenant", back_populates="restaurants")
    staff_members = relationship("Staff", back_populates="restaurant")
    categories = relationship("Category", back_populates="restaurant")
    tables = relationship("RestaurantTable", back_populates="restaurant")
    reservations = relationship("Reservation", back_populates="restaurant")
    orders = relationship("Order", back_populates="restaurant")

class RestaurantTable(Base):
    table_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(50), ForeignKey('restaurants.restaurant_id'), nullable=False)
    table_number = Column(Integer, nullable=False)
    qr_code_string = Column(Text)
    status = Column(Boolean, default=True)

    restaurant = relationship("Restaurant", back_populates="tables")
    orders = relationship("Order", back_populates="table")
    reservations = relationship("Reservation", back_populates="table")

class Reservation(Base):
    reservation_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(50), ForeignKey('tenants.tenant_id'), nullable=False)
    restaurant_id = Column(String(50), ForeignKey('restaurants.restaurant_id'), nullable=False)
    table_id = Column(String(50), ForeignKey('restaurant_tables.table_id'))
    customer_id = Column(String(50), ForeignKey('customers.customer_id'))
    booking_time = Column(DateTime(timezone=True), nullable=False)
    guest_count = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    restaurant = relationship("Restaurant", back_populates="reservations")
    table = relationship("RestaurantTable", back_populates="reservations")
    customer = relationship("Customer", back_populates="reservations")