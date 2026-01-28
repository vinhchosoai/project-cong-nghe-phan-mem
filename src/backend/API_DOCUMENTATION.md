# S2O - Smart Restaurant Management Platform API

## Overview

S2O is a multi-tenant SaaS platform for smart restaurant management with QR code ordering capabilities. The backend is built with FastAPI and PostgreSQL, implementing a complete multi-tenant architecture with strict data isolation.

## Project Structure

```
app/
├── api/
│   ├── endpoints/
│   │   ├── auth_restaurants.py     # Auth & restaurant management
│   │   ├── guest_orders.py         # Guest ordering system
│   │   ├── menu.py                 # Menu management
│   │   ├── admin.py                # Admin operations
│   │   ├── ai.py                   # AI features (chatbot, recommendations)
│   │   └── customer.py             # Customer profile & loyalty
│   ├── router.py                   # Main router
│   └── deps.py                     # Dependency injection
├── core/
│   ├── config.py                   # Settings & environment
│   ├── security.py                 # JWT & password hashing
│   ├── middleware.py               # Tenant middleware
│   └── exeptions.py                # Custom exceptions
├── crud/
│   ├── base.py                     # Base CRUD classes (with tenant support)
│   ├── crud_restaurant.py
│   ├── crud_menu.py
│   ├── crud_order.py
│   └── crud_user.py
├── db/
│   ├── base_class.py               # SQLAlchemy base class
│   ├── base.py                     # Model imports
│   └── session.py                  # Database connection
├── models/                         # SQLAlchemy models
│   ├── restaurant.py               # Restaurant & Table models
│   ├── user.py                     # User model
│   ├── menu.py                     # Menu & Category models
│   ├── order.py                    # Order & Payment models
│   └── ai.py                       # Chat logs model
├── schemas/                        # Pydantic schemas
│   ├── user.py
│   ├── restaurant.py
│   ├── menu.py
│   ├── order.py
│   ├── ai.py
│   ├── enums.py                    # Shared enums
│   └── common.py                   # Common schemas
└── services/                       # Business logic
    ├── auth_service.py
    ├── restaurant_service.py
    ├── menu_service.py
    ├── order_service.py
    ├── payment_service.py
    ├── ai_service.py
    └── customer_service.py
```

## Key Features

### Multi-Tenancy
- Each restaurant is a separate tenant with isolated data
- Tenant ID is extracted from `X-Tenant-ID` header
- TenantMiddleware enforces tenant isolation on protected endpoints

### Authentication
- JWT-based authentication
- Role-based access control (ADMIN, RESTAURANT_MANAGER, CHEF, STAFF, CUSTOMER)
- Password hashing with bcrypt

### Guest Ordering
- Guests can order via QR code without login
- Session-based table orders
- Real-time order status tracking

### Menu Management
- Restaurants can manage menu items
- Category-based organization
- Availability control

### Order Management
- Complete order lifecycle (PENDING → CONFIRMED → PREPARING → READY → COMPLETED)
- Order item tracking with pricing
- Support for notes per item

### Payment Processing
- Multiple payment methods (CASH, BANK_TRANSFER, E_WALLET)
- Payment status tracking
- Transaction ID management

### AI Features
- Restaurant QA chatbot (rule-based, extensible to RAG)
- Recommendation engine
- Chat history logging

### Customer Loyalty
- Membership tiers (IRON, SILVER, GOLD, DIAMOND)
- Loyalty points system
- Order history tracking

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Restaurants
- `GET /api/v1/restaurants` - List all restaurants
- `GET /api/v1/restaurants/{id}` - Get restaurant details
- `POST /api/v1/restaurants` - Create restaurant (with owner)
- `PUT /api/v1/restaurants/{id}` - Update restaurant
- `POST /api/v1/restaurants/{id}/tables` - Create table
- `GET /api/v1/restaurants/{id}/tables` - List tables

### Menu
- `GET /api/v1/menu/restaurants/{id}/menu` - Get full menu
- `GET /api/v1/menu/restaurants/{id}/menu/category/{category_id}` - Get menu by category
- `POST /api/v1/menu/restaurants/{id}/menu/items` - Create menu item (staff)
- `PUT /api/v1/menu/restaurants/{id}/menu/items/{item_id}` - Update menu item
- `PATCH /api/v1/menu/restaurants/{id}/menu/items/{item_id}/availability` - Toggle availability

### Guest Orders
- `POST /api/v1/guest/orders` - Create order
- `GET /api/v1/guest/orders/{id}` - Get order status
- `GET /api/v1/guest/orders/table/{table_id}` - Get table orders
- `POST /api/v1/guest/orders/{id}/status` - Update order status

### Customer
- `GET /api/v1/customer/profile` - Get customer profile
- `GET /api/v1/customer/order-history` - Get order history
- `POST /api/v1/customer/redeem-points` - Redeem loyalty points

### AI
- `POST /api/v1/ai/chat` - Ask restaurant question
- `POST /api/v1/ai/recommendations` - Get recommendations

### Admin
- `GET /api/v1/admin/restaurants` - List all restaurants
- `PATCH /api/v1/admin/restaurants/{id}/activate` - Activate restaurant
- `PATCH /api/v1/admin/restaurants/{id}/deactivate` - Deactivate restaurant
- `GET /api/v1/admin/users` - List all users
- `PATCH /api/v1/admin/users/{id}/deactivate` - Deactivate user

## Headers

### Required Headers
- `X-Tenant-ID`: Restaurant ID for multi-tenant requests (required for protected endpoints except /auth)
- `Authorization`: Bearer token (optional, for authenticated endpoints)

Example:
```
X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/s2o_db

# Redis (for caching)
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# AI
OPENAI_API_KEY=your-api-key
QDRANT_URL=http://localhost:6333

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]
```

## Exception Handling

The API uses custom exceptions for better error handling:

- `BusinessLogicException` - Business logic violations (400/409)
- `ValidationException` - Validation errors (422)
- `ResourceNotFoundException` - Resource not found (404)
- `UnauthorizedException` - Authentication failed (401)
- `ForbiddenException` - Authorization failed (403)
- `TenantException` - Tenant-related errors (400)

## Running the Application

### Development
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production
```bash
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "message"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Testing

Tests are located in `tests/` directory using pytest and fixtures.

```bash
pytest tests/ -v
```

## Deployment

The application is containerized with Docker:

```bash
docker-compose up -d
```

See `docker-compose.yml` and `requirements.txt` for details.

## Contributing

1. Follow PEP 8 style guide
2. Add type hints to all functions
3. Write tests for new features
4. Update documentation

## License

MIT License
