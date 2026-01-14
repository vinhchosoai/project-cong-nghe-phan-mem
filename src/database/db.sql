CREATE TABLE "User" (
    userID VARCHAR(50) NOT NULL,
    userName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (userID)
);

CREATE TABLE Tenant (
    tenantID VARCHAR(50) NOT NULL,
    userID VARCHAR(50) NOT NULL,
    PRIMARY KEY (tenantID),
    FOREIGN KEY (userID) REFERENCES "User"(userID)
);

CREATE TABLE Restaurant (
    restaurantID VARCHAR(50) NOT NULL,
    tenantID VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    status BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (restaurantID),
    FOREIGN KEY (tenantID) REFERENCES Tenant(tenantID)
);

CREATE TABLE Staff (
    staffID VARCHAR(50) NOT NULL,
    restaurantID VARCHAR(50) NOT NULL,
    userID VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (staffID),
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID),
    FOREIGN KEY (userID) REFERENCES "User"(userID)
);

CREATE TABLE Category (
    categoryID VARCHAR(50) NOT NULL,
    restaurantID VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    displayIndex INT DEFAULT 0,
    PRIMARY KEY (categoryID),
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID)
);

CREATE TABLE MenuItem (
    itemID VARCHAR(50) NOT NULL,
    categoryID VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(19, 4) NOT NULL,
    imageURL TEXT,
    isAvailable BOOLEAN DEFAULT TRUE,
    aiTags TEXT,
    PRIMARY KEY (itemID),
    FOREIGN KEY (categoryID) REFERENCES Category(categoryID)
);

CREATE TABLE "Table" (
    tableID VARCHAR(50) NOT NULL,
    restaurantID VARCHAR(50) NOT NULL,
    tableNumber INT NOT NULL,
    qrCodeString TEXT,
    status BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (tableID),
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID)
);

CREATE TABLE Customer (
    customerID VARCHAR(50) NOT NULL,
    userID VARCHAR(50) NOT NULL,
    membershipTier VARCHAR(50),
    currentPoints INT DEFAULT 0,
    password VARCHAR(255),
    PRIMARY KEY (customerID),
    FOREIGN KEY (userID) REFERENCES "User"(userID)
);

CREATE TABLE Reservation (
    reservationID VARCHAR(50) NOT NULL,
    tenantID VARCHAR(50) NOT NULL,
    restaurantID VARCHAR(50) NOT NULL,
    tableID VARCHAR(50),
    customerID VARCHAR(50),
    bookingTime DATETIME NOT NULL,
    guestCount INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    PRIMARY KEY (reservationID),
    FOREIGN KEY (tenantID) REFERENCES Tenant(tenantID),
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID),
    FOREIGN KEY (tableID) REFERENCES "Table"(tableID),
    FOREIGN KEY (customerID) REFERENCES Customer(customerID)
);

CREATE TABLE "Order" (
    orderID VARCHAR(50) NOT NULL,
    tenantID VARCHAR(50) NOT NULL,
    restaurantID VARCHAR(50) NOT NULL,
    customerID VARCHAR(50),
    tableID VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    totalAmount DECIMAL(19, 4) DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (orderID),
    FOREIGN KEY (tenantID) REFERENCES Tenant(tenantID),
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID),
    FOREIGN KEY (customerID) REFERENCES Customer(customerID),
    FOREIGN KEY (tableID) REFERENCES "Table"(tableID)
);

CREATE TABLE OrderDetail (
    orderDetailID VARCHAR(50) NOT NULL,
    tenantID VARCHAR(50) NOT NULL,
    restaurantID VARCHAR(50) NOT NULL,
    orderID VARCHAR(50) NOT NULL,
    itemID VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unitPrice DECIMAL(19, 4) NOT NULL,
    note TEXT,
    PRIMARY KEY (orderDetailID),
    FOREIGN KEY (tenantID) REFERENCES Tenant(tenantID),
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID),
    FOREIGN KEY (orderID) REFERENCES "Order"(orderID),
    FOREIGN KEY (itemID) REFERENCES MenuItem(itemID)
);

CREATE TABLE Invoice (
    invoiceID VARCHAR(50) NOT NULL,
    tenantID VARCHAR(50) NOT NULL,
    restaurantID VARCHAR(50) NOT NULL,
    customerID VARCHAR(50),
    orderID VARCHAR(50) NOT NULL,
    paymentMethod VARCHAR(50),
    amountPaid DECIMAL(19, 4) NOT NULL,
    paymentTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (invoiceID),
    FOREIGN KEY (tenantID) REFERENCES Tenant(tenantID),
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID),
    FOREIGN KEY (customerID) REFERENCES Customer(customerID),
    FOREIGN KEY (orderID) REFERENCES "Order"(orderID)
);

CREATE TABLE Revenue (
    revenueID VARCHAR(50) NOT NULL,
    tenantID VARCHAR(50) NOT NULL,
    restaurantID VARCHAR(50) NOT NULL,
    invoiceID VARCHAR(50) NOT NULL,
    reportDate DATE NOT NULL,
    totalRevenue DECIMAL(19, 4) NOT NULL,
    lastUpdate DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (revenueID),
    FOREIGN KEY (tenantID) REFERENCES Tenant(tenantID),
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID),
    FOREIGN KEY (invoiceID) REFERENCES Invoice(invoiceID)
);