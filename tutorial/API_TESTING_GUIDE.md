# S2O API Testing Guide

## Quick Start Testing

### 1. Start the Services
```bash
docker-compose up --build
```

Wait for all services to be healthy:
- PostgreSQL: port 5432
- Redis: port 6379
- Qdrant: port 6333
- FastAPI: port 8000

### 2. Access API Documentation
```
http://localhost:8000/docs
```

### 3. Test Tenant Isolation
All requests MUST include `X-Tenant-ID` header:

```bash
X-Tenant-ID: tenant-001
X-Tenant-ID: tenant-002
```

## API Test Examples

### Create Order
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "X-Tenant-ID: tenant-001" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "rest-001",
    "customer_id": "cust-001",
    "table_id": "table-001",
    "status": "pending",
    "total_amount": 150.50,
    "order_details": [
      {
        "item_id": "item-001",
        "quantity": 2,
        "unit_price": 50.25,
        "note": "Extra spicy"
      }
    ]
  }'
```

### Get Order
```bash
curl -X GET http://localhost:8000/api/v1/orders/order-001 \
  -H "X-Tenant-ID: tenant-001"
```

### Update Order Status
```bash
curl -X PATCH http://localhost:8000/api/v1/orders/order-001 \
  -H "X-Tenant-ID: tenant-001" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### List Restaurant Orders
```bash
curl -X GET "http://localhost:8000/api/v1/orders/restaurant/rest-001?skip=0&limit=10" \
  -H "X-Tenant-ID: tenant-001"
```

### List Customer Orders
```bash
curl -X GET "http://localhost:8000/api/v1/orders/customer/cust-001?skip=0&limit=10" \
  -H "X-Tenant-ID: tenant-001"
```

### Filter by Status
```bash
curl -X GET "http://localhost:8000/api/v1/orders/status/pending?skip=0&limit=10" \
  -H "X-Tenant-ID: tenant-001"
```

### Delete Order
```bash
curl -X DELETE http://localhost:8000/api/v1/orders/order-001 \
  -H "X-Tenant-ID: tenant-001"
```

## WebSocket Testing

### Connect to WebSocket
```bash
wscat -c ws://localhost:8000/ws/orders/tenant-001
```

### Expected Messages

**Order Created Event:**
```json
{
  "event": "order_created",
  "data": {
    "order_id": "order-001",
    "restaurant_id": "rest-001",
    "status": "pending",
    "total_amount": "150.50",
    "created_at": "2026-01-29T10:30:00"
  }
}
```

**Order Status Changed Event:**
```json
{
  "event": "order_status_changed",
  "order_id": "order-001",
  "status": "completed"
}
```

## Health Check
```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "environment": "development"
}
```

## Testing Multi-Tenancy

### Tenant A creates order:
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "X-Tenant-ID: tenant-a" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "rest-a",
    "customer_id": "cust-a",
    "status": "pending",
    "total_amount": 100.00,
    "order_details": []
  }'
```

### Tenant B tries to access Tenant A's order:
```bash
curl -X GET http://localhost:8000/api/v1/orders/order-a \
  -H "X-Tenant-ID: tenant-b"
```

**Result**: Returns empty/404 (Tenant isolation working correctly)

## PostgreSQL Database Inspection

Connect to PostgreSQL:
```bash
docker exec -it s2o_postgres psql -U postgres -d s2o_db
```

View tables:
```sql
\dt

SELECT * FROM orders WHERE tenant_id = 'tenant-001';
```

## Redis Pub/Sub Monitoring

Monitor Redis channels:
```bash
docker exec -it s2o_redis redis-cli SUBSCRIBE "orders:tenant-001"
```

## Debugging

### View Backend Logs
```bash
docker logs -f s2o_backend
```

### View Database Logs
```bash
docker logs -f s2o_postgres
```

### View Redis Logs
```bash
docker logs -f s2o_redis
```

## Common Issues

### Missing X-Tenant-ID Header
**Error**: 401 Unauthorized - "X-Tenant-ID header is required"
**Solution**: Add header to all requests

### Connection Refused
**Error**: Connection refused to localhost:5432
**Solution**: Ensure docker-compose services are running (docker-compose ps)

### Database Not Initialized
**Error**: Table does not exist
**Solution**: 
1. Ensure PostgreSQL health check passed
2. Restart backend service: `docker-compose restart backend`

## Performance Testing

### Load Test Orders Creation
```bash
for i in {1..100}; do
  curl -X POST http://localhost:8000/api/v1/orders \
    -H "X-Tenant-ID: tenant-load-test" \
    -H "Content-Type: application/json" \
    -d '{
      "restaurant_id": "rest-load-'$i'",
      "status": "pending",
      "total_amount": 50.00,
      "order_details": []
    }' &
done
wait
```

## Notes

- All endpoints except `/health` and `/` require `X-Tenant-ID` header
- WebSocket connections are tenant-specific
- Orders are automatically filtered by tenant_id
- Real-time updates broadcast to all connected clients of same tenant
- No cross-tenant data access is possible
