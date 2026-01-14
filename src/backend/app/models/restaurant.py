from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Restaurant(Base):
    __tablename__ = "Restaurant"

    restaurantID = Column(String(50), primary_key=True)
    tenantID = Column(String(50), ForeignKey("Tenant.tenantID"), nullable=False)
    name = Column(String(255), nullable=False)
    address = Column(String(255))
    status = Column(Boolean, default=True)

    tenant = relationship("Tenant", back_populates="restaurants")
    staff_members = relationship("Staff", back_populates="restaurant")
    categories = relationship("Category", back_populates="restaurant")
    tables = relationship("Table", back_populates="restaurant")
    orders = relationship("Order", back_populates="restaurant")

class Table(Base):
    __tablename__ = "Table"

    tableID = Column(String(50), primary_key=True)
    restaurantID = Column(String(50), ForeignKey("Restaurant.restaurantID"), nullable=False)
    tableNumber = Column(Integer, nullable=False)
    qrCodeString = Column(String)
    status = Column(Boolean, default=True)

    restaurant = relationship("Restaurant", back_populates="tables")
    orders = relationship("Order", back_populates="table")

class Reservation(Base):
    __tablename__ = "Reservation"

    reservationID = Column(String(50), primary_key=True)
    tenantID = Column(String(50), ForeignKey("Tenant.tenantID"), nullable=False)
    restaurantID = Column(String(50), ForeignKey("Restaurant.restaurantID"), nullable=False)
    tableID = Column(String(50), ForeignKey("Table.tableID"))
    customerID = Column(String(50), ForeignKey("Customer.customerID"))
    bookingTime = Column(DateTime, nullable=False)
    guestCount = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False)