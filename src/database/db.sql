CREATE TABLE users (
    user_id VARCHAR(50) NOT NULL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tenants (
    tenant_id VARCHAR(50) NOT NULL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE restaurants (
    restaurant_id VARCHAR(50) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE staff (
    staff_id VARCHAR(50) NOT NULL PRIMARY KEY,
    restaurant_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE categories (
    category_id VARCHAR(50) NOT NULL PRIMARY KEY,
    restaurant_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_index INT DEFAULT 0,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);

CREATE TABLE menu_items (
    item_id VARCHAR(50) NOT NULL PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(19, 4) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    ai_tags TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE restaurant_tables (
    table_id VARCHAR(50) NOT NULL PRIMARY KEY,
    restaurant_id VARCHAR(50) NOT NULL,
    table_number INT NOT NULL,
    qr_code_string TEXT,
    status BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);

CREATE TABLE customers (
    customer_id VARCHAR(50) NOT NULL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    membership_tier VARCHAR(50),
    current_points INT DEFAULT 0,
    password_hash VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE reservations (
    reservation_id VARCHAR(50) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    restaurant_id VARCHAR(50) NOT NULL,
    table_id VARCHAR(50),
    customer_id VARCHAR(50),
    booking_time TIMESTAMP WITH TIME ZONE NOT NULL,
    guest_count INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(table_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE orders (
    order_id VARCHAR(50) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    restaurant_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50),
    table_id VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    total_amount DECIMAL(19, 4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(table_id)
);

CREATE TABLE order_details (
    order_detail_id VARCHAR(50) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    restaurant_id VARCHAR(50) NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    item_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(19, 4) NOT NULL,
    note TEXT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);

CREATE TABLE invoices (
    invoice_id VARCHAR(50) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    restaurant_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50),
    order_id VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50),
    amount_paid DECIMAL(19, 4) NOT NULL,
    payment_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE revenues (
    revenue_id VARCHAR(50) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    restaurant_id VARCHAR(50) NOT NULL,
    invoice_id VARCHAR(50) NOT NULL,
    report_date DATE NOT NULL,
    total_revenue DECIMAL(19, 4) NOT NULL,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
);