from sqlalchemy import Column, String, ForeignKey, Integer, DateTime, Numeric, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Order(Base):
    __tablename__ = "Order"

    orderID = Column(String(50), primary_key=True)
    tenantID = Column(String(50), ForeignKey("Tenant.tenantID"), nullable=False)
    restaurantID = Column(String(50), ForeignKey("Restaurant.restaurantID"), nullable=False)
    customerID = Column(String(50), ForeignKey("Customer.customerID"))
    tableID = Column(String(50), ForeignKey("Table.tableID"))
    status = Column(String(50), nullable=False)
    totalAmount = Column(Numeric(19, 4), default=0)
    createdAt = Column(DateTime, default=func.now())

    restaurant = relationship("Restaurant", back_populates="orders")
    customer = relationship("Customer", back_populates="orders")
    table = relationship("Table", back_populates="orders")
    order_details = relationship("OrderDetail", back_populates="order")
    invoice = relationship("Invoice", back_populates="order", uselist=False)

class OrderDetail(Base):
    __tablename__ = "OrderDetail"

    orderDetailID = Column(String(50), primary_key=True)
    tenantID = Column(String(50), ForeignKey("Tenant.tenantID"), nullable=False)
    restaurantID = Column(String(50), ForeignKey("Restaurant.restaurantID"), nullable=False)
    orderID = Column(String(50), ForeignKey("Order.orderID"), nullable=False)
    itemID = Column(String(50), ForeignKey("MenuItem.itemID"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unitPrice = Column(Numeric(19, 4), nullable=False)
    note = Column(Text)

    order = relationship("Order", back_populates="order_details")
    item = relationship("MenuItem") 
class Invoice(Base):
    __tablename__ = "Invoice"

    invoiceID = Column(String(50), primary_key=True)
    tenantID = Column(String(50), ForeignKey("Tenant.tenantID"), nullable=False)
    restaurantID = Column(String(50), ForeignKey("Restaurant.restaurantID"), nullable=False)
    customerID = Column(String(50), ForeignKey("Customer.customerID"))
    orderID = Column(String(50), ForeignKey("Order.orderID"), nullable=False)
    paymentMethod = Column(String(50))
    amountPaid = Column(Numeric(19, 4), nullable=False)
    paymentTime = Column(DateTime, default=func.now())

    order = relationship("Order", back_populates="invoice")
    revenue_report = relationship("Revenue", back_populates="invoice", uselist=False)

class Revenue(Base):
    __tablename__ = "Revenue"

    revenueID = Column(String(50), primary_key=True)
    tenantID = Column(String(50), ForeignKey("Tenant.tenantID"), nullable=False)
    restaurantID = Column(String(50), ForeignKey("Restaurant.restaurantID"), nullable=False)
    invoiceID = Column(String(50), ForeignKey("Invoice.invoiceID"), nullable=False)
    reportDate = Column(Date, nullable=False)
    totalRevenue = Column(Numeric(19, 4), nullable=False)
    lastUpdate = Column(DateTime, default=func.now(), onupdate=func.now())

    invoice = relationship("Invoice", back_populates="revenue_report")