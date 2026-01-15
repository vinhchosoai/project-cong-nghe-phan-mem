from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    RESTAURANT_MANAGER = "RESTAURANT_MANAGER"
    STAFF = "STAFF"
    CHEF = "CHEF"
    CUSTOMER = "CUSTOMER"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PREPARING = "PREPARING"
    READY = "READY"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class TableStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    OCCUPIED = "OCCUPIED"
    RESERVED = "RESERVED"

class PaymentMethod(str, Enum):
    CASH = "CASH"
    BANK_TRANSFER = "BANK_TRANSFER"
    E_WALLET = "E_WALLET"

class MembershipTier(str, Enum):
    IRON = "IRON"
    SILVER = "SILVER"
    GOLD = "GOLD"
    DIAMOND = "DIAMOND"