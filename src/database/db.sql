CREATE TABLE `User` (
    `userID` VARCHAR(36) NOT NULL,
    `userName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phoneNumber` VARCHAR(20),
    `password` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`userID`)
);

CREATE TABLE `Tenant` (
    `tenantID` VARCHAR(36) NOT NULL,
    `userID` VARCHAR(36) NOT NULL,
    PRIMARY KEY (`tenantID`),
    CONSTRAINT `FK_Tenant_User` FOREIGN KEY (`userID`) REFERENCES `User` (`userID`)
);

CREATE TABLE `Restaurant` (
    `restaurantID` VARCHAR(36) NOT NULL,
    `tenantID` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `address` TEXT,
    `status` BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (`restaurantID`),
    CONSTRAINT `FK_Restaurant_Tenant` FOREIGN KEY (`tenantID`) REFERENCES `Tenant` (`tenantID`)
);

CREATE TABLE `Staff` (
    `staffID` VARCHAR(36) NOT NULL,
    `restaurantID` VARCHAR(36) NOT NULL,
    `userID` VARCHAR(36) NOT NULL,
    `role` VARCHAR(50),
    PRIMARY KEY (`staffID`),
    CONSTRAINT `FK_Staff_Restaurant` FOREIGN KEY (`restaurantID`) REFERENCES `Restaurant` (`restaurantID`),
    CONSTRAINT `FK_Staff_User` FOREIGN KEY (`userID`) REFERENCES `User` (`userID`)
);

CREATE TABLE `Customer` (
    `customerID` VARCHAR(36) NOT NULL,
    `userID` VARCHAR(36) NOT NULL,
    `membershipTier` VARCHAR(50) DEFAULT 'Bronze',
    `currentPoints` INT DEFAULT 0,
    PRIMARY KEY (`customerID`),
    CONSTRAINT `FK_Customer_User` FOREIGN KEY (`userID`) REFERENCES `User` (`userID`)
);

CREATE TABLE `Category` (
    `categoryID` VARCHAR(36) NOT NULL,
    `restaurantID` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `displayIndex` INT DEFAULT 0,
    PRIMARY KEY (`categoryID`),
    CONSTRAINT `FK_Category_Restaurant` FOREIGN KEY (`restaurantID`) REFERENCES `Restaurant` (`restaurantID`)
);

CREATE TABLE `MenuItem` (
    `itemID` VARCHAR(36) NOT NULL,
    `categoryID` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(19, 2) NOT NULL,
    `imageURL` TEXT,
    `isAvailable` BOOLEAN DEFAULT TRUE,
    `aiTags` TEXT,
    PRIMARY KEY (`itemID`),
    CONSTRAINT `FK_MenuItem_Category` FOREIGN KEY (`categoryID`) REFERENCES `Category` (`categoryID`)
);

CREATE TABLE `Table` (
    `tableID` VARCHAR(36) NOT NULL,
    `restaurantID` VARCHAR(36) NOT NULL,
    `tableNumber` INT NOT NULL,
    `qrCodeString` VARCHAR(255),
    `status` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`tableID`),
    CONSTRAINT `FK_Table_Restaurant` FOREIGN KEY (`restaurantID`) REFERENCES `Restaurant` (`restaurantID`)
);

CREATE TABLE `Reservation` (
    `reservationID` VARCHAR(36) NOT NULL,
    `tenantID` VARCHAR(36) NOT NULL,
    `restaurantID` VARCHAR(36) NOT NULL,
    `tableID` VARCHAR(36),
    `customerID` VARCHAR(36),
    `bookingTime` DATETIME NOT NULL,
    `guestCount` INT DEFAULT 1,
    `status` VARCHAR(50),
    PRIMARY KEY (`reservationID`),
    CONSTRAINT `FK_Reservation_Restaurant` FOREIGN KEY (`restaurantID`) REFERENCES `Restaurant` (`restaurantID`),
    CONSTRAINT `FK_Reservation_Table` FOREIGN KEY (`tableID`) REFERENCES `Table` (`tableID`),
    CONSTRAINT `FK_Reservation_Customer` FOREIGN KEY (`customerID`) REFERENCES `Customer` (`customerID`)
);

CREATE TABLE `Order` (
    `orderID` VARCHAR(36) NOT NULL,
    `tenantID` VARCHAR(36) NOT NULL,
    `restaurantID` VARCHAR(36) NOT NULL,
    `customerID` VARCHAR(36),
    `tableID` VARCHAR(36),
    `status` VARCHAR(50),
    `totalAmount` DECIMAL(19, 2) DEFAULT 0,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`orderID`),
    CONSTRAINT `FK_Order_Restaurant` FOREIGN KEY (`restaurantID`) REFERENCES `Restaurant` (`restaurantID`),
    CONSTRAINT `FK_Order_Customer` FOREIGN KEY (`customerID`) REFERENCES `Customer` (`customerID`),
    CONSTRAINT `FK_Order_Table` FOREIGN KEY (`tableID`) REFERENCES `Table` (`tableID`)
);

CREATE TABLE `OrderDetail` (
    `orderDetailID` VARCHAR(36) NOT NULL,
    `orderID` VARCHAR(36) NOT NULL,
    `itemID` VARCHAR(36) NOT NULL,
    `tenantID` VARCHAR(36) NOT NULL,
    `restaurantID` VARCHAR(36) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `unitPrice` DECIMAL(19, 2) NOT NULL,
    `note` TEXT,
    PRIMARY KEY (`orderDetailID`),
    CONSTRAINT `FK_OrderDetail_Order` FOREIGN KEY (`orderID`) REFERENCES `Order` (`orderID`),
    CONSTRAINT `FK_OrderDetail_Item` FOREIGN KEY (`itemID`) REFERENCES `MenuItem` (`itemID`)
);

CREATE TABLE `Invoice` (
    `invoiceID` VARCHAR(36) NOT NULL,
    `tenantID` VARCHAR(36) NOT NULL,
    `restaurantID` VARCHAR(36) NOT NULL,
    `orderID` VARCHAR(36) NOT NULL,
    `paymentMethod` VARCHAR(50),
    `amountPaid` DECIMAL(19, 2) NOT NULL,
    `paymentTime` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`invoiceID`),
    CONSTRAINT `FK_Invoice_Order` FOREIGN KEY (`orderID`) REFERENCES `Order` (`orderID`)
);