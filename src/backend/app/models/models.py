from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, Numeric, ForeignKey, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
Base = declarative_base()
class User(Base):
    __tablename__ = "users"
    user_id = Column(String(50), primary_key=True)
    username = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone_number = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="customer", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    tenants = relationship("Tenant", back_populates="user", cascade="all, delete-orphan")
    staff = relationship("Staff", back_populates="user", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="user")
class Tenant(Base):
    __tablename__ = "tenants"
    tenant_id = Column(String(50), primary_key=True)
    user_id = Column(String(50), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="tenants")
    restaurants = relationship("Restaurant", back_populates="tenant", cascade="all, delete-orphan")
    reservations = relationship("Reservation", back_populates="tenant")
    orders = relationship("Order", back_populates="tenant")
    order_details = relationship("OrderDetail", back_populates="tenant")
    invoices = relationship("Invoice", back_populates="tenant")
    revenues = relationship("Revenue", back_populates="tenant")
class Restaurant(Base):
    __tablename__ = "restaurants"
    restaurant_id = Column(String(50), primary_key=True)
    tenant_id = Column(String(50), ForeignKey("tenants.tenant_id"), nullable=False)
    name = Column(String(255), nullable=False)
    address = Column(String(255), nullable=True)
    status = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    tenant = relationship("Tenant", back_populates="restaurants")
    staff = relationship("Staff", back_populates="restaurant", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="restaurant", cascade="all, delete-orphan")
    tables = relationship("RestaurantTable", back_populates="restaurant", cascade="all, delete-orphan")
    reservations = relationship("Reservation", back_populates="restaurant", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="restaurant", cascade="all, delete-orphan")
    order_details = relationship("OrderDetail", back_populates="restaurant", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="restaurant", cascade="all, delete-orphan")
    revenues = relationship("Revenue", back_populates="restaurant", cascade="all, delete-orphan")
    ingredients = relationship("Ingredient", back_populates="restaurant", cascade="all, delete-orphan")
    table_requests = relationship("TableRequest", back_populates="restaurant", cascade="all, delete-orphan")
class Staff(Base):
    __tablename__ = "staff"
    staff_id = Column(String(50), primary_key=True)
    restaurant_id = Column(String(50), ForeignKey("restaurants.restaurant_id"), nullable=False)
    user_id = Column(String(50), ForeignKey("users.user_id"), nullable=False)
    role = Column(String(50), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    restaurant = relationship("Restaurant", back_populates="staff")
    user = relationship("User", back_populates="staff")
class Category(Base):
    __tablename__ = "categories"
    category_id = Column(String(50), primary_key=True)
    restaurant_id = Column(String(50), ForeignKey("restaurants.restaurant_id"), nullable=False)
    name = Column(String(100), nullable=False)
    display_index = Column(Integer, default=0)
    restaurant = relationship("Restaurant", back_populates="categories")
    menu_items = relationship("MenuItem", back_populates="category", cascade="all, delete-orphan")
class MenuItem(Base):
    __tablename__ = "menu_items"
    item_id = Column(String(50), primary_key=True)
    category_id = Column(String(50), ForeignKey("categories.category_id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(19, 4), nullable=False)
    image_url = Column(Text, nullable=True)
    is_available = Column(Boolean, default=True)
    ai_tags = Column(Text, nullable=True)
    category = relationship("Category", back_populates="menu_items")
    order_details = relationship("OrderDetail", back_populates="menu_item")
class RestaurantTable(Base):
    __tablename__ = "restaurant_tables"
    table_id = Column(String(50), primary_key=True)
    restaurant_id = Column(String(50), ForeignKey("restaurants.restaurant_id"), nullable=False)
    table_number = Column(Integer, nullable=False)
    qr_code_string = Column(Text, nullable=True)
    status = Column(Boolean, default=True)
    restaurant = relationship("Restaurant", back_populates="tables")
    reservations = relationship("Reservation", back_populates="table")
    orders = relationship("Order", back_populates="table")
    table_requests = relationship("TableRequest", back_populates="table")
class Customer(Base):
    __tablename__ = "customers"
    customer_id = Column(String(50), primary_key=True)
    user_id = Column(String(50), ForeignKey("users.user_id"), nullable=False)
    membership_tier = Column(String(50), nullable=True)
    current_points = Column(Integer, default=0)
    password_hash = Column(String(255), nullable=True)
    user = relationship("User", back_populates="customers")
    reservations = relationship("Reservation", back_populates="customer")
    orders = relationship("Order", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")
class Reservation(Base):
    __tablename__ = "reservations"
    reservation_id = Column(String(50), primary_key=True)
    tenant_id = Column(String(50), ForeignKey("tenants.tenant_id"), nullable=False)
    restaurant_id = Column(String(50), ForeignKey("restaurants.restaurant_id"), nullable=False)
    table_id = Column(String(50), ForeignKey("restaurant_tables.table_id"), nullable=True)
    customer_id = Column(String(50), ForeignKey("customers.customer_id"), nullable=True)
    booking_time = Column(DateTime, nullable=False)
    guest_count = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    tenant = relationship("Tenant", back_populates="reservations")
    restaurant = relationship("Restaurant", back_populates="reservations")
    table = relationship("RestaurantTable", back_populates="reservations")
    customer = relationship("Customer", back_populates="reservations")
class Order(Base):
    __tablename__ = "orders"
    order_id = Column(String(50), primary_key=True)
    tenant_id = Column(String(50), ForeignKey("tenants.tenant_id"), nullable=False)
    restaurant_id = Column(String(50), ForeignKey("restaurants.restaurant_id"), nullable=False)
    customer_id = Column(String(50), ForeignKey("customers.customer_id"), nullable=True)
    table_id = Column(String(50), ForeignKey("restaurant_tables.table_id"), nullable=True)
    status = Column(String(50), nullable=False)
    total_amount = Column(Numeric(19, 4), default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    tenant = relationship("Tenant", back_populates="orders")
    restaurant = relationship("Restaurant", back_populates="orders")
    customer = relationship("Customer", back_populates="orders")
    table = relationship("RestaurantTable", back_populates="orders")
    order_details = relationship("OrderDetail", back_populates="order", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="order", cascade="all, delete-orphan")
    @property
    def table_number(self):
        return self.table.table_number if self.table else None
class OrderDetail(Base):
    __tablename__ = "order_details"
    order_detail_id = Column(String(50), primary_key=True)
    tenant_id = Column(String(50), ForeignKey("tenants.tenant_id"), nullable=False)
    restaurant_id = Column(String(50), ForeignKey("restaurants.restaurant_id"), nullable=False)
    order_id = Column(String(50), ForeignKey("orders.order_id"), nullable=False)
    item_id = Column(String(50), ForeignKey("menu_items.item_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(19, 4), nullable=False)
    note = Column(Text, nullable=True)
    tenant = relationship("Tenant", back_populates="order_details")
    restaurant = relationship("Restaurant", back_populates="order_details")
    order = relationship("Order", back_populates="order_details")
    menu_item = relationship("MenuItem", back_populates="order_details")
    @property
    def item_name(self):
        return self.menu_item.name if self.menu_item else "Unknown"
class Invoice(Base):
    __tablename__ = "invoices"
    invoice_id = Column(String(50), primary_key=True)
    tenant_id = Column(String(50), ForeignKey("tenants.tenant_id"), nullable=False)
    restaurant_id = Column(String(50), ForeignKey("restaurants.restaurant_id"), nullable=False)
    customer_id = Column(String(50), ForeignKey("customers.customer_id"), nullable=True)
    order_id = Column(String(50), ForeignKey("orders.order_id"), nullable=False)
    payment_method = Column(String(50), nullable=True)
    amount_paid = Column(Numeric(19, 4), nullable=False)
    payment_time = Column(DateTime, default=datetime.utcnow)
    tenant = relationship("Tenant", back_populates="invoices")
    restaurant = relationship("Restaurant", back_populates="invoices")
    customer = relationship("Customer", back_populates="invoices")
    order = relationship("Order", back_populates="invoices")
    revenues = relationship("Revenue", back_populates="invoice")
class Revenue(Base):
    __tablename__ = "revenues"
    revenue_id = Column(String(50), primary_key=True)
    tenant_id = Column(String(50), ForeignKey("tenants.tenant_id"), nullable=False)
    restaurant_id = Column(String(50), ForeignKey("restaurants.restaurant_id"), nullable=False)
    invoice_id = Column(String(50), ForeignKey("invoices.invoice_id"), nullable=False)
    report_date = Column(Date, nullable=False)
    total_revenue = Column(Numeric(19, 4), nullable=False)
    last_update = Column(DateTime, default=datetime.utcnow)
    tenant = relationship("Tenant", back_populates="revenues")
    restaurant = relationship("Restaurant", back_populates="revenues")
    invoice = relationship("Invoice", back_populates="revenues")
class Ingredient(Base):
    __tablename__ = "ingredients"
    ingredient_id = Column(String(50), primary_key=True)
    restaurant_id = Column(String(50), ForeignKey("restaurants.restaurant_id"), nullable=False)
    name = Column(String(255), nullable=False)
    quantity = Column(Numeric(19, 4), default=0)
    unit = Column(String(50), nullable=False)
    is_available = Column(Boolean, default=True)
    restaurant = relationship("Restaurant", back_populates="ingredients")
class TableRequest(Base):
    __tablename__ = "table_requests"
    request_id = Column(String(50), primary_key=True)
    restaurant_id = Column(String(50), ForeignKey("restaurants.restaurant_id"), nullable=False)
    table_id = Column(String(50), ForeignKey("restaurant_tables.table_id"), nullable=False)
    request_type = Column(String(50), nullable=False)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    restaurant = relationship("Restaurant", back_populates="table_requests")
    table = relationship("RestaurantTable", back_populates="table_requests")