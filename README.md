# S2O - SaaS Smart Restaurant Management Platform

A comprehensive backend system for restaurant management with real-time ordering, multi-tenancy support, and AI-powered menu assistance.

## Architecture Overview

### Tech Stack
- **Backend**: FastAPI, SQLAlchemy (Async), Pydantic
- **Database**: PostgreSQL (Primary), Redis (Caching & Pub/Sub), Qdrant (Vector DB for AI)
- **Frontend**: Next.js (Web), React Native (Mobile)
- **Design Pattern**: Repository Pattern with Multi-tenancy via Middleware

## Project Structure

```
project-cong-nghe-phan-mem/
├── src/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── api/              # API Endpoints
│   │   │   ├── core/             # Config, Security, Middleware
│   │   │   ├── db/               # Database Session
│   │   │   ├── models/           # SQLAlchemy ORM Models
│   │   │   ├── schemas/          # Pydantic DTOs
│   │   │   ├── repositories/     # Repository Pattern
│   │   │   ├── services/         # Business Logic
│   │   │   ├── websockets/       # Real-time Communication
│   │   │   └── main.py           # FastAPI Application Entry Point
│   │   ├── tests/                # Test Suite
│   │   ├── alembic/              # Database Migrations
│   │   ├── Dockerfile            # Container Configuration
│   │   ├── requirements.txt       # Python Dependencies
│   │   └── .env                  # Environment Variables
│   ├── database/                 # Database Scripts
│   ├── frontend_web/             # Next.js Web Application
│   └── frontend_app/             # React Native Mobile App
└── docker-compose.yml            # Container Orchestration

```

## Key Features

### 1. Multi-Tenancy
- Tenant context stored in HTTP headers (`X-Tenant-ID`)
- Automatic data isolation at repository level
- Context variables for thread-safe tenant management

### 2. Real-time Order Management
- Redis Pub/Sub for multi-worker communication
- WebSocket support for live order updates
- Broadcaster pattern for event handling

### 3. Repository Pattern
- Automatic tenant_id filtering on all queries
- Type-safe CRUD operations
- Clean separation of concerns (API → Service → Repository → DB)

### 4. AI Integration
- Google Gemini API for chatbot
- Qdrant vector database for menu embeddings
- RAG (Retrieval-Augmented Generation) for intelligent responses

## Setup & Installation

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- PostgreSQL 15+

### Quick Start

1. Clone the repository:
```bash
cd project-cong-nghe-phan-mem
```

2. Start services with Docker Compose:
```bash
docker-compose up --build
```

3. Access the API:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### Environment Configuration

Update `.env` file with:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/s2o_db
REDIS_URL=redis://localhost:6379/0
QDRANT_URL=http://localhost:6333
GOOGLE_GEMINI_API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here
```

## API Endpoints

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/{order_id}` - Get order
- `GET /api/v1/orders/restaurant/{restaurant_id}` - List restaurant orders
- `PATCH /api/v1/orders/{order_id}` - Update order status
- `DELETE /api/v1/orders/{order_id}` - Delete order

### WebSocket
- `WS /ws/orders/{tenant_id}` - Real-time order updates

## Database Schema

The system uses the following main entities:
- **Users**: System users
- **Tenants**: Restaurant organizations
- **Restaurants**: Individual restaurant locations
- **Staff**: Restaurant employees
- **MenuItems**: Available dishes
- **Orders**: Customer orders
- **Reservations**: Table reservations
- **Invoices**: Payment records
- **Revenues**: Revenue reports

## Security

- JWT-based authentication (to be implemented)
- Tenant isolation middleware
- CORS configuration
- Role-based access control (to be implemented)

## Testing

Run tests:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app
```

## Database Migrations

Create migration:
```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

## Performance Considerations

- Async/await for non-blocking operations
- Connection pooling (max 20 connections)
- Redis caching layer
- Vector database for fast similarity search

## Contributing

1. Follow the Repository Pattern
2. Use async/await for all I/O operations
3. Add tenant_id filtering to all queries
4. Write tests for new features
5. No comments in production code

## License

Proprietary - S2O Project
