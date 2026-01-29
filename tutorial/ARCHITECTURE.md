# S2O Architecture Deep Dive

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│  Browser (Guest/Admin)  │  Mobile App (React Native)  │  WebSocket  │
└────────────┬──────────────────────────────────────────────────┬─────┘
             │                                                  │
             │ HTTP + X-Tenant-ID Header                        │ WS
             │                                                  │
┌────────────▼──────────────────────────────────────────────────▼─────┐
│                      FASTAPI APPLICATION                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    MIDDLEWARE LAYER                           │   │
│  │  ┌─────────────────────┐  ┌──────────────┐  ┌─────────────┐ │   │
│  │  │ TenantMiddleware    │  │ CORS         │  │ Exception   │ │   │
│  │  │ (X-Tenant-ID)       │  │ Middleware   │  │ Handlers    │ │   │
│  │  └─────────────────────┘  └──────────────┘  └─────────────┘ │   │
│  └──────────┬─────────────────────────────────────────────┬─────┘   │
│             │                                             │         │
│  ┌──────────▼──────────────────────────────────────┬──────▼──────┐  │
│  │           API LAYER (/api/v1)                    │ WebSocket   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │ Manager     │  │
│  │  │Orders Router│  │Menu Router  │  │Res.Rout│  │             │  │
│  │  └─────────────┘  └─────────────┘  └─────────┘  └─────────────┘  │
│  └──────────┬──────────────────────────────────────────┬─────────┘  │
│             │                                          │            │
│  ┌──────────▼──────────────────────────────────────────▼─────────┐  │
│  │           SERVICE LAYER (Business Logic)                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │  │
│  │  │OrderService  │  │MenuService   │  │AIService         │   │  │
│  │  │              │  │              │  │(Gemini + Qdrant) │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘   │  │
│  └──────────┬──────────────────────────────┬────────────────────┘  │
│             │                              │                      │
│  ┌──────────▼──────────────────────────────▼────────────────────┐  │
│  │      REPOSITORY LAYER (Data Access)                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │  │
│  │  │OrderRepository   │MenuRepository   │CustomRepository  │   │  │
│  │  │(BaseRepository)  │(BaseRepository) │(BaseRepository)  │   │  │
│  │  │+ Tenant Filter   │+ Tenant Filter  │+ Tenant Filter   │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘   │  │
│  └──────────┬──────────────────────────────────────────────────┘  │
│             │                                                    │
│  ┌──────────▼──────────────────────────────────────────────────┐  │
│  │         CONTEXT & CONFIGURATION LAYER                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │  │
│  │  │ContextVar   │  │ Settings     │  │ Exceptions       │   │  │
│  │  │ (tenant_id)  │  │ (.env based) │  │ (Custom)         │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘   │  │
│  └──────────┬──────────────────────────────────────────────────┘  │
└─────────────┼──────────────────────────────────────────────────────┘
              │
      ┌───────┴───────────────────────┬────────────────────┐
      │                               │                    │
      ▼                               ▼                    ▼
┌──────────────┐            ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │            │    Redis     │    │   Qdrant     │
│              │            │              │    │              │
│  Tables:     │            │  Channels:   │    │  Embeddings: │
│  • users     │            │  orders:*    │    │  menu_items  │
│  • tenants   │            │              │    │              │
│  • orders    │            │  Cache       │    │  RAG Search  │
│  • items     │            │              │    │              │
│  • invoices  │            │  Pub/Sub     │    │  AI Search   │
│  + 8 more    │            │              │    │              │
└──────────────┘            └──────────────┘    └──────────────┘
```

## Request Flow Diagram

```
1. CLIENT REQUEST
   ├─ Headers: X-Tenant-ID: tenant-001
   ├─ Method: POST /api/v1/orders
   └─ Body: Order data

2. MIDDLEWARE PROCESSING
   ├─ TenantMiddleware.dispatch()
   │  ├─ Extract X-Tenant-ID from headers
   │  ├─ set_tenant_id(tenant_id) → contextvars
   │  └─ Continue to next middleware
   └─ CORS, Exception handlers applied

3. API ENDPOINT
   ├─ orders_router.create_order()
   ├─ Receive: OrderCreate schema (Pydantic validated)
   └─ Call: OrderService.create_order()

4. SERVICE LAYER
   ├─ OrderService.create_order()
   ├─ Validate business logic
   ├─ Call: OrderRepository.create_order()
   └─ Trigger: broadcaster.publish_order_created()

5. REPOSITORY LAYER
   ├─ OrderRepository.create_order()
   ├─ Retrieve: get_tenant_id() from contextvars
   ├─ Create Order obj with tenant_id
   ├─ Create OrderDetail objs with tenant_id
   ├─ Execute: INSERT INTO orders ... WHERE tenant_id = 'tenant-001'
   └─ Return: Order object

6. DATABASE
   ├─ PostgreSQL INSERT
   └─ Data stored with tenant_id for isolation

7. BROADCASTING
   ├─ broadcaster.publish_order_created()
   ├─ Redis channel: "orders:tenant-001"
   ├─ Message: {"event": "order_created", "data": {...}}
   └─ Published to all subscribers

8. WEBSOCKET
   ├─ Clients connected to ws://localhost:8000/ws/orders/tenant-001
   ├─ ConnectionManager.broadcast(tenant_id, message)
   └─ All clients receive update

9. RESPONSE
   ├─ Return: OrderResponse (Pydantic serialized)
   ├─ Status: 201 Created
   └─ Headers: Content-Type: application/json
```

## Multi-Tenancy Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    INCOMING REQUEST                          │
│                                                              │
│  POST /api/v1/orders                                        │
│  Headers: {                                                 │
│    "X-Tenant-ID": "restaurant-chain-a",                    │
│    "Content-Type": "application/json"                       │
│  }                                                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│           TenantMiddleware.dispatch()                        │
│                                                              │
│  1. Extract header: tenant_id = "restaurant-chain-a"        │
│  2. Validate: if not tenant_id → raise 401                 │
│  3. Store: contextvars.tenant_id_var.set("restaurant-a")   │
│  4. Continue: await call_next(request)                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│           API Endpoint (create_order)                        │
│                                                              │
│  - Pydantic validates request schema                        │
│  - Calls: OrderService.create_order()                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│           OrderService.create_order()                        │
│                                                              │
│  - Passes order_data to repository                          │
│  - Calls: OrderRepository.create_order()                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│           OrderRepository.create_order()                     │
│                                                              │
│  1. tenant_id = get_tenant_id()                            │
│     → contextvars.tenant_id_var.get()                      │
│     → Returns "restaurant-chain-a"                         │
│                                                              │
│  2. Inject: order_data['tenant_id'] = "restaurant-chain-a" │
│                                                              │
│  3. Create ORM object:                                       │
│     order = Order(**order_data)                             │
│     # Has tenant_id="restaurant-chain-a"                   │
│                                                              │
│  4. Add to session: session.add(order)                      │
│  5. Commit: await session.commit()                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│           PostgreSQL INSERT                                  │
│                                                              │
│  INSERT INTO orders (                                        │
│    order_id,                                                │
│    tenant_id,                                               │
│    restaurant_id,                                           │
│    status,                                                  │
│    total_amount,                                            │
│    created_at                                               │
│  ) VALUES (                                                 │
│    'order-xyz',                                             │
│    'restaurant-chain-a',      ← AUTOMATIC ISOLATION        │
│    'rest-001',                                              │
│    'pending',                                               │
│    150.50,                                                  │
│    NOW()                                                    │
│  )                                                          │
│                                                              │
│  ✓ Row stored with tenant_id for permanent isolation      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│           Query Isolation Example                            │
│                                                              │
│  When Restaurant B tries to GET order-xyz:                 │
│                                                              │
│  GET /api/v1/orders/order-xyz                              │
│  Headers: { "X-Tenant-ID": "restaurant-chain-b" }          │
│                                                              │
│  OrderRepository.get_by_id("order-xyz")                    │
│  ├─ tenant_id = get_tenant_id()                            │
│  │  → "restaurant-chain-b"                                 │
│  ├─ SELECT * FROM orders                                   │
│  │  WHERE order_id = 'order-xyz'                          │
│  │  AND tenant_id = 'restaurant-chain-b'                   │
│  ├─ Result: EMPTY (no rows match)                          │
│  └─ Return: None                                           │
│                                                              │
│  ✗ Restaurant B cannot access Restaurant A's orders       │
└──────────────────────────────────────────────────────────────┘
```

## Database Isolation Strategy

### Tenant ID Embedding
- Every table that has `tenant_id` column automatically filters
- Implemented at ORM level in BaseRepository
- No way to bypass from application code

### Query Example
```python
# WITHOUT proper tenant filtering (WRONG - would be dangerous):
await db.execute(select(Order).where(Order.order_id == order_id))

# WITH tenant filtering (CORRECT - implemented):
await db.execute(select(Order).where(
    Order.order_id == order_id,
    Order.tenant_id == get_tenant_id()
))
```

### Context Variable Flow
```
HTTP Request (X-Tenant-ID: tenant-a)
        ↓
TenantMiddleware sets contextvars.tenant_id_var = "tenant-a"
        ↓
Throughout entire request context:
  - Service layer can access: get_tenant_id() → "tenant-a"
  - Repository layer filters: WHERE tenant_id = "tenant-a"
  - Multiple services in same request use same tenant_id
        ↓
Request ends
        ↓
Context cleared automatically (finally block)
```

## Real-Time Order Updates Architecture

### Event Flow
```
1. OrderService.update_order_status(order_id, "completed")
   ↓
2. broadcaster.publish_order_status_changed(order_id, "completed")
   ├─ tenant_id = get_tenant_id()
   ├─ channel = f"orders:{tenant_id}"  # "orders:restaurant-a"
   ├─ message = {
   │    "event": "order_status_changed",
   │    "order_id": "order-xyz",
   │    "status": "completed"
   │  }
   └─ redis_client.publish(channel, json.dumps(message))
   ↓
3. Redis Pub/Sub broadcasts to channel "orders:restaurant-a"
   ↓
4. All subscribers listening to "orders:restaurant-a" receive message
   ├─ Broadcaster.listen() task in background
   ├─ Calls callbacks for each message
   └─ ConnectionManager.broadcast() sends to all WebSocket clients
   ↓
5. Connected WebSocket clients receive JSON message:
   {
     "event": "order_status_changed",
     "order_id": "order-xyz",
     "status": "completed"
   }
   ↓
6. Frontend (React/React Native) updates UI in real-time
```

### Multi-Worker Scenario
```
Worker 1 (Uvicorn Worker 1)
├─ Handles requests for restaurant-a
├─ WS connections: client-1, client-2
└─ local memory: active_connections["restaurant-a"] = [client-1, client-2]

Worker 2 (Uvicorn Worker 2)
├─ Handles requests for restaurant-b
├─ WS connections: client-3
└─ local memory: active_connections["restaurant-b"] = [client-3]

Worker 3 (Uvicorn Worker 3)
├─ Handles requests for restaurant-a
├─ WS connections: client-4
└─ local memory: active_connections["restaurant-a"] = [client-4]

When Client-1 (Worker-1) places order:
  ├─ Order created in DB
  ├─ Publish to Redis: "orders:restaurant-a"
  ├─ All workers subscribe to "orders:restaurant-a"
  ├─ Broadcasting task receives message
  │  ├─ Worker-1: broadcasts to [client-1, client-2]
  │  ├─ Worker-2: has no restaurant-a connections, does nothing
  │  └─ Worker-3: broadcasts to [client-4]
  └─ Result: All clients for restaurant-a updated in real-time
```

## Performance Optimizations

### Connection Pooling
- PostgreSQL: 20 connections max
- Keep-alive enabled: pool_pre_ping=True
- Reduces connection overhead

### Async/Await
- Non-blocking I/O operations
- Multiple requests processed concurrently
- Better resource utilization

### Caching Strategy (Redis)
- Future: Cache frequently accessed data
- Menu items, restaurant info
- Reduces database hits

### Vector Database (Qdrant)
- Fast similarity search for AI
- Embeddings pre-computed
- Efficient RAG queries

## Error Handling

### Exception Hierarchy
```
AppException (base)
├─ TenantException (404)
├─ UnauthorizedException (401)
├─ ForbiddenException (403)
├─ ValidationException (422)
├─ NotFoundException (404)
├─ ConflictException (409)
└─ InternalServerException (500)
```

### Example Flow
```python
try:
    order = await order_repo.get_by_id(order_id)
    if not order:
        raise NotFoundException("Order not found")
except NotFoundException as e:
    # Exception handler triggered
    return JSONResponse(
        status_code=404,
        content={"detail": "Order not found"}
    )
```

## Security Considerations

### 1. Tenant Isolation (Implemented)
- Middleware enforces X-Tenant-ID header
- Repository layer auto-filters by tenant
- No cross-tenant data leakage possible

### 2. Authentication (TODO)
- JWT tokens for user authentication
- Password hashing with bcrypt
- Protected endpoints

### 3. Authorization (TODO)
- Role-based access control (RBAC)
- Admin, staff, customer roles
- Permission checks in services

### 4. Input Validation (Implemented)
- Pydantic models validate all inputs
- Type hints prevent type confusion
- Range checks for numeric fields

### 5. CORS Configuration (Implemented)
- Configurable allowed origins
- Prevents cross-origin attacks
- Can be disabled for development

## Deployment Considerations

### Docker Compose (Development)
- Services run in containers
- Volumes persist data
- Health checks monitor services

### Production Deployment (Future)
- Use Kubernetes for orchestration
- Separate database backups
- Environment-specific .env files
- Rate limiting
- Request logging
- Monitoring and alerting

## Testing Strategy

### Unit Tests (TODO)
- Test each service method
- Mock repositories
- Check business logic

### Integration Tests (TODO)
- Test full request flow
- Real database (test container)
- WebSocket testing

### Load Tests (TODO)
- Apache JMeter / k6
- Test concurrent orders
- Measure response times

### Security Tests (TODO)
- Test tenant isolation
- Try cross-tenant access
- SQL injection attempts
- Authorization bypass attempts
