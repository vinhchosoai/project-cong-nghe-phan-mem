# Backend Testing Guide - S2O Project

Hướng dẫn chi tiết testing các chức năng backend bao gồm CRUD User, Restaurant và workflow đặt hàng.

## Mục lục

1. [Chuẩn bị môi trường](#chuẩn-bị-môi-trường)
2. [Setup Database](#setup-database)
3. [CRUD User](#crud-user)
4. [CRUD Restaurant](#crud-restaurant)
5. [Workflow Đặt Hàng](#workflow-đặt-hàng)
6. [Testing Multi-Tenancy](#testing-multi-tenancy)

---

## Chuẩn bị môi trường

### 1. Start Docker Services

```bash
cd d:\project\cong_nghe_phan_mem
docker-compose up -d
```

Kiểm tra các services:
```bash
docker-compose ps
```

Kết quả mong đợi:
```
NAME                COMMAND                 SERVICE             STATUS
cong-nghe-postgres  postgres                postgres            Up (healthy)
cong-nghe-redis     redis-server            redis               Up (healthy)
cong-nghe-qdrant    ./qdrant                qdrant              Up (healthy)
cong-nghe-backend   uvicorn app.main:app    backend             Up
```

### 2. Kiểm tra Health Check

```bash
curl -X GET http://localhost:8000/health
```

Kết quả mong đợi:
```json
{
  "status": "ok",
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

### 3. Database Credentials

```
Host: localhost
Port: 5432
User: postgres
Password: Daicavinh11
Database: s2o_db
```

---

## Setup Database

### 1. Import Schema

```bash
psql -h localhost -U postgres -d s2o_db -f src/database/db.sql
```

### 2. Verify Tables

```bash
psql -h localhost -U postgres -d s2o_db -c "\dt"
```

### 3. Xem Data Structure

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

---

## CRUD User

### 1.1 Tạo User (Create)

**Endpoint**: `POST /api/v1/users`

**Không cần X-Tenant-ID header** - Public endpoint

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer_001",
    "email": "customer@example.com",
    "phone_number": "0912345678",
    "password": "Password@123"
  }'
```

**Response** (201 Created):
```json
{
  "user_id": "user-abc123def456",
  "username": "customer_001",
  "email": "customer@example.com",
  "phone_number": "0912345678",
  "created_at": "2026-01-29T10:00:00"
}
```

---

### 1.2 Tạo Admin User

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_001",
    "email": "admin@restaurant.vn",
    "phone_number": "0987654321",
    "password": "AdminPass@123"
  }'
```

---

### 1.3 Tạo Staff User

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "staff_kitchen",
    "email": "kitchen@restaurant.vn",
    "phone_number": "0912111111",
    "password": "StaffPass@123"
  }'
```

**Lưu ý**: Ghi lại `user_id` từ response để sử dụng trong các request sau

---

### 1.4 Lấy thông tin User (Read)

**Endpoint**: `GET /api/v1/users/{user_id}`

**Request**:
```bash
curl -X GET http://localhost:8000/api/v1/users/user-abc123def456
```

**Response**:
```json
{
  "user_id": "user-abc123def456",
  "username": "customer_001",
  "email": "customer@example.com",
  "phone_number": "0912345678",
  "created_at": "2026-01-29T10:00:00"
}
```

---

### 1.5 Danh sách Users (List)

**Endpoint**: `GET /api/v1/users`

**Request** (Lấy 10 users đầu tiên):
```bash
curl -X GET "http://localhost:8000/api/v1/users?skip=0&limit=10"
```

**Response**:
```json
{
  "items": [
    {
      "user_id": "user-abc123def456",
      "username": "customer_001",
      "email": "customer@example.com",
      "phone_number": "0912345678",
      "created_at": "2026-01-29T10:00:00"
    },
    {
      "user_id": "user-xyz789uvw012",
      "username": "admin_001",
      "email": "admin@restaurant.vn",
      "phone_number": "0987654321",
      "created_at": "2026-01-29T10:05:00"
    }
  ],
  "total": 3,
  "skip": 0,
  "limit": 10
}
```

---

### 1.6 Tìm kiếm Users

**Endpoint**: `GET /api/v1/users/search/{search_term}`

**Request** (Tìm users chứa "customer"):
```bash
curl -X GET "http://localhost:8000/api/v1/users/search/customer?skip=0&limit=10"
```

**Response**:
```json
{
  "items": [
    {
      "user_id": "user-abc123def456",
      "username": "customer_001",
      "email": "customer@example.com",
      "phone_number": "0912345678",
      "created_at": "2026-01-29T10:00:00"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 10
}
```

---

### 1.7 Cập nhật User (Update)

**Endpoint**: `PATCH /api/v1/users/{user_id}`

**Request** (Cập nhật email và phone):
```bash
curl -X PATCH http://localhost:8000/api/v1/users/user-abc123def456 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer_new@example.com",
    "phone_number": "0911111111",
    "password": "NewPassword@123"
  }'
```

**Response** (200 OK):
```json
{
  "user_id": "user-abc123def456",
  "username": "customer_001",
  "email": "customer_new@example.com",
  "phone_number": "0911111111",
  "created_at": "2026-01-29T10:00:00"
}
```

---

### 1.8 Xóa User (Delete)

**Endpoint**: `DELETE /api/v1/users/{user_id}`

**Request**:
```bash
curl -X DELETE http://localhost:8000/api/v1/users/user-abc123def456
```

**Response**: 204 No Content

---

### 1.9 User Login (Authentication)

**Endpoint**: `POST /api/v1/users/login`

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer_001",
    "password": "Password@123"
  }'
```

**Response** (200 OK):
```json
{
  "user_id": "user-abc123def456",
  "username": "customer_001",
  "email": "customer@example.com",
  "phone_number": "0912345678",
  "created_at": "2026-01-29T10:00:00"
}
```

**Error Response** (401 Unauthorized):
```json
{
  "detail": "Invalid username or password"
}
```

---

### 1.10 Test User Duplicate (Conflict)

**Request** (Tạo user với username đã tồn tại):
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer_001",
    "email": "newmail@example.com",
    "password": "Password@123"
  }'
```

**Response** (409 Conflict):
```json
{
  "detail": "Username 'customer_001' already exists"
}
```

---

### 1.11 Test Invalid Email

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "invalid-email",
    "password": "Password@123"
  }'
```

**Response** (422 Unprocessable Entity):
```json
{
  "detail": "Invalid email format"
}
```

---

### 1.12 Test Short Password

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "123"
  }'
```

**Response** (422 Unprocessable Entity):
```json
{
  "detail": "Password must be at least 6 characters"
}
```

---

---

### 1.6 Update User

**Endpoint**: `PATCH /api/v1/users/{user_id}`

**Request**:
```bash
curl -X PATCH http://localhost:8000/api/v1/users/user-admin-001 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "email": "admin_new@thailan.vn",
    "full_name": "Nguyễn Văn Admin New"
  }'
```

---

### 1.7 Delete User

**Endpoint**: `DELETE /api/v1/users/{user_id}`

**Request**:
```bash
curl -X DELETE http://localhost:8000/api/v1/users/user-admin-001 \
  -H "X-Tenant-ID: tenant-001"
```

**Response**: 204 No Content

---

### 1.8 Danh sách Users

**Endpoint**: `GET /api/v1/users`

**Request**:
```bash
curl -X GET "http://localhost:8000/api/v1/users?skip=0&limit=10" \
  -H "X-Tenant-ID: tenant-001"
```

**Response**:
```json
{
  "items": [
    {
      "id": "user-admin-001",
      "username": "admin_thailan",
      "email": "admin@thailan.vn",
      "role": "admin",
      "full_name": "Nguyễn Văn Admin"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 10
}
```

---

## CRUD Restaurant

### 2.1 Tạo Restaurant

**Endpoint**: `POST /api/v1/restaurants`

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/restaurants \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "name": "Chi nhánh Nguyễn Huệ",
    "address": "123 Nguyễn Huệ, HCMC",
    "phone": "0912345678",
    "opening_time": "11:00",
    "closing_time": "22:00",
    "total_tables": 20
  }'
```

**Response** (201 Created):
```json
{
  "id": "rest-001",
  "name": "Chi nhánh Nguyễn Huệ",
  "address": "123 Nguyễn Huệ, HCMC",
  "phone": "0912345678",
  "opening_time": "11:00",
  "closing_time": "22:00",
  "total_tables": 20,
  "created_at": "2026-01-29T10:00:00"
}
```

---

### 2.2 Lấy thông tin Restaurant

**Endpoint**: `GET /api/v1/restaurants/{restaurant_id}`

**Request**:
```bash
curl -X GET http://localhost:8000/api/v1/restaurants/rest-001 \
  -H "X-Tenant-ID: tenant-001"
```

---

### 2.3 Update Restaurant

**Endpoint**: `PATCH /api/v1/restaurants/{restaurant_id}`

**Request**:
```bash
curl -X PATCH http://localhost:8000/api/v1/restaurants/rest-001 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "opening_time": "10:00",
    "closing_time": "23:00",
    "total_tables": 25
  }'
```

---

### 2.4 Delete Restaurant

**Endpoint**: `DELETE /api/v1/restaurants/{restaurant_id}`

**Request**:
```bash
curl -X DELETE http://localhost:8000/api/v1/restaurants/rest-001 \
  -H "X-Tenant-ID: tenant-001"
```

---

### 2.5 Danh sách Restaurants

**Endpoint**: `GET /api/v1/restaurants`

**Request**:
```bash
curl -X GET "http://localhost:8000/api/v1/restaurants?skip=0&limit=10" \
  -H "X-Tenant-ID: tenant-001"
```

---

## CRUD Menu

### 3.1 Tạo Category

**Endpoint**: `POST /api/v1/categories`

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/categories \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "name": "Món Khai Vị",
    "description": "Các món khai vị ngon tuyệt"
  }'
```

**Response**:
```json
{
  "id": "cat-001",
  "name": "Món Khai Vị",
  "description": "Các món khai vị ngon tuyệt",
  "created_at": "2026-01-29T10:00:00"
}
```

---

### 3.2 Tạo MenuItem

**Endpoint**: `POST /api/v1/menu-items`

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/menu-items \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "name": "Gỏi Cuốn",
    "description": "Gỏi cuốn tươi ngon",
    "price": 35000,
    "category_id": "cat-001",
    "image_url": "https://example.com/goi-cuon.jpg",
    "is_available": true
  }'
```

**Response**:
```json
{
  "id": "menu-001",
  "name": "Gỏi Cuốn",
  "description": "Gỏi cuốn tươi ngon",
  "price": 35000,
  "category_id": "cat-001",
  "is_available": true,
  "created_at": "2026-01-29T10:00:00"
}
```

---

### 3.3 Tạo thêm Menuitems để test

**Menu Items để tạo**:

```bash
# Mục Chính
curl -X POST http://localhost:8000/api/v1/menu-items \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "name": "Cơm Chicken Pad Thai",
    "description": "Gà xào cay kiểu Thái",
    "price": 85000,
    "category_id": "cat-001",
    "is_available": true
  }'

curl -X POST http://localhost:8000/api/v1/menu-items \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "name": "Tom Yum Goong",
    "description": "Canh chua cay tôm",
    "price": 95000,
    "category_id": "cat-001",
    "is_available": true
  }'

curl -X POST http://localhost:8000/api/v1/menu-items \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "name": "Green Curry",
    "description": "Cà ri xanh gà",
    "price": 80000,
    "category_id": "cat-001",
    "is_available": true
  }'
```

---

## Workflow Đặt Hàng

### Quy trình:
1. **Khách hàng tạo Order** (Trạng thái: `pending`)
2. **Bếp xem Order** và bắt đầu chuẩn bị (Cập nhật trạng thái: `preparing`)
3. **Bếp xác nhận hoàn tất** (Cập nhật trạng thái: `ready`)
4. **Phục vụ viên lấy món** và phục vụ khách (Cập nhật trạng thái: `served`)
5. **Thanh toán** (Cập nhật trạng thái: `completed`)

---

### 4.1 Khách hàng Tạo Order

**Endpoint**: `POST /api/v1/orders`

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "restaurant_id": "rest-001",
    "customer_id": "customer-001",
    "table_number": 5,
    "total_price": 210000,
    "order_details": [
      {
        "menu_item_id": "menu-001",
        "quantity": 2,
        "unit_price": 35000,
        "note": "Không cay"
      },
      {
        "menu_item_id": "menu-002",
        "quantity": 1,
        "unit_price": 85000,
        "note": "Thêm tương ớt"
      },
      {
        "menu_item_id": "menu-003",
        "quantity": 1,
        "unit_price": 95000,
        "note": "Không tỏi"
      }
    ]
  }'
```

**Response** (201 Created):
```json
{
  "id": "order-001",
  "restaurant_id": "rest-001",
  "customer_id": "customer-001",
  "table_number": 5,
  "total_price": 210000,
  "status": "pending",
  "order_details": [
    {
      "id": "order-detail-001",
      "menu_item_id": "menu-001",
      "quantity": 2,
      "unit_price": 35000,
      "note": "Không cay"
    }
  ],
  "created_at": "2026-01-29T10:00:00",
  "updated_at": "2026-01-29T10:00:00"
}
```

**Lưu ý**: Ghi lại `order-001` để test các bước tiếp theo

---

### 4.2 Bếp xem Order (GET)

**Endpoint**: `GET /api/v1/orders/{order_id}`

**Request**:
```bash
curl -X GET http://localhost:8000/api/v1/orders/order-001 \
  -H "X-Tenant-ID: tenant-001"
```

**Response**:
```json
{
  "id": "order-001",
  "restaurant_id": "rest-001",
  "customer_id": "customer-001",
  "table_number": 5,
  "total_price": 210000,
  "status": "pending",
  "order_details": [
    {
      "id": "order-detail-001",
      "menu_item_id": "menu-001",
      "quantity": 2,
      "unit_price": 35000,
      "note": "Không cay"
    },
    {
      "id": "order-detail-002",
      "menu_item_id": "menu-002",
      "quantity": 1,
      "unit_price": 85000,
      "note": "Thêm tương ớt"
    },
    {
      "id": "order-detail-003",
      "menu_item_id": "menu-003",
      "quantity": 1,
      "unit_price": 95000,
      "note": "Không tỏi"
    }
  ],
  "created_at": "2026-01-29T10:00:00"
}
```

---

### 4.3 Danh sách Orders theo Restaurant

**Endpoint**: `GET /api/v1/orders/restaurant/{restaurant_id}`

**Request** (Bếp xem tất cả orders của nhà hàng):
```bash
curl -X GET "http://localhost:8000/api/v1/orders/restaurant/rest-001?skip=0&limit=20" \
  -H "X-Tenant-ID: tenant-001"
```

**Response**:
```json
{
  "items": [
    {
      "id": "order-001",
      "restaurant_id": "rest-001",
      "table_number": 5,
      "status": "pending",
      "total_price": 210000,
      "created_at": "2026-01-29T10:00:00"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 20
}
```

---

### 4.4 Danh sách Orders theo Status

**Endpoint**: `GET /api/v1/orders/status/{status}`

**Request** (Lấy tất cả orders chưa bắt đầu):
```bash
curl -X GET "http://localhost:8000/api/v1/orders/status/pending?skip=0&limit=20" \
  -H "X-Tenant-ID: tenant-001"
```

---

### 4.5 Bếp bắt đầu chuẩn bị (Update Status: pending → preparing)

**Endpoint**: `PATCH /api/v1/orders/{order_id}`

**Request**:
```bash
curl -X PATCH http://localhost:8000/api/v1/orders/order-001 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "status": "preparing"
  }'
```

**Response** (200 OK):
```json
{
  "id": "order-001",
  "status": "preparing",
  "updated_at": "2026-01-29T10:05:00",
  "message": "Order đang được chuẩn bị"
}
```

**WebSocket Event** (Broadcast to all clients):
```json
{
  "event": "order_status_changed",
  "order_id": "order-001",
  "status": "preparing",
  "timestamp": "2026-01-29T10:05:00"
}
```

---

### 4.6 Bếp xác nhận món đã xong (Update Status: preparing → ready)

**Endpoint**: `PATCH /api/v1/orders/{order_id}`

**Request**:
```bash
curl -X PATCH http://localhost:8000/api/v1/orders/order-001 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "status": "ready"
  }'
```

**Response** (200 OK):
```json
{
  "id": "order-001",
  "status": "ready",
  "updated_at": "2026-01-29T10:15:00",
  "message": "Order đã sẵn sàng phục vụ"
}
```

**WebSocket Event**:
```json
{
  "event": "order_status_changed",
  "order_id": "order-001",
  "status": "ready",
  "timestamp": "2026-01-29T10:15:00"
}
```

---

### 4.7 Phục vụ viên xác nhận đã phục vụ (Update Status: ready → served)

**Endpoint**: `PATCH /api/v1/orders/{order_id}`

**Request**:
```bash
curl -X PATCH http://localhost:8000/api/v1/orders/order-001 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "status": "served"
  }'
```

**Response**:
```json
{
  "id": "order-001",
  "status": "served",
  "updated_at": "2026-01-29T10:16:00"
}
```

---

### 4.8 Khách hàng Thanh toán (Update Status: served → completed)

**Endpoint**: `PATCH /api/v1/orders/{order_id}`

**Request**:
```bash
curl -X PATCH http://localhost:8000/api/v1/orders/order-001 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "status": "completed"
  }'
```

**Response**:
```json
{
  "id": "order-001",
  "status": "completed",
  "updated_at": "2026-01-29T10:20:00"
}
```

---

### 4.9 Update Order Details (Thay đổi chi tiết order)

**Endpoint**: `PATCH /api/v1/order-details/{order_detail_id}`

**Request** (Tăng số lượng hoặc thay đổi ghi chú):
```bash
curl -X PATCH http://localhost:8000/api/v1/order-details/order-detail-001 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "quantity": 3,
    "note": "Không cay, thêm nước mắm"
  }'
```

---

### 4.10 Delete Order (Hủy order)

**Endpoint**: `DELETE /api/v1/orders/{order_id}`

**Request** (Chỉ có thể hủy order chưa bắt đầu):
```bash
curl -X DELETE http://localhost:8000/api/v1/orders/order-001 \
  -H "X-Tenant-ID: tenant-001"
```

**Response**: 204 No Content

---

## WebSocket Real-Time Testing

### 5.1 Kết nối WebSocket

**Endpoint**: `WS /ws/orders/{tenant_id}`

**Sử dụng wscat hoặc websocat**:

```bash
npm install -g wscat
wscat -c ws://localhost:8000/ws/orders/tenant-001
```

hoặc:

```bash
websocat ws://localhost:8000/ws/orders/tenant-001
```

---

### 5.2 Test Real-Time Order Updates

**Terminal 1** (Khách hàng/Phục vụ viên lắng nghe):
```bash
wscat -c ws://localhost:8000/ws/orders/tenant-001
```

**Terminal 2** (Bếp cập nhật order status):
```bash
curl -X PATCH http://localhost:8000/api/v1/orders/order-001 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-001" \
  -d '{
    "status": "preparing"
  }'
```

**Kết quả trong Terminal 1** (Nhận được sự kiện):
```json
{
  "event": "order_status_changed",
  "order_id": "order-001",
  "status": "preparing",
  "timestamp": "2026-01-29T10:05:00"
}
```

---

## Testing Multi-Tenancy

### 6.1 Kiểm tra Tenant Isolation

Tạo 2 Tenants khác nhau và test xem liệu dữ liệu có bị rò rỉ hay không

**Tenant 1**: `tenant-001` (Nhà hàng Thái Lan)
**Tenant 2**: `tenant-002` (Nhà hàng Việt)

---

### 6.2 Tạo Tenant 2

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Nhà hàng Việt",
    "phone": "0987654321",
    "address": "456 Lê Thánh Tôn, HCMC"
  }'
```

---

### 6.3 Tạo dữ liệu cho Tenant 2

```bash
# Tạo restaurant cho tenant-002
curl -X POST http://localhost:8000/api/v1/restaurants \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-002" \
  -d '{
    "name": "Chi nhánh Lê Thánh Tôn",
    "address": "456 Lê Thánh Tôn, HCMC",
    "phone": "0987654321",
    "opening_time": "11:00",
    "closing_time": "22:00",
    "total_tables": 15
  }'
```

---

### 6.4 Test Isolation - Tenant 1 không thấy dữ liệu Tenant 2

**Request** (Lấy restaurants của Tenant 1):
```bash
curl -X GET http://localhost:8000/api/v1/restaurants \
  -H "X-Tenant-ID: tenant-001"
```

**Kết quả mong đợi**: Chỉ thấy restaurant của `tenant-001`, KHÔNG thấy restaurant của `tenant-002`

```json
{
  "items": [
    {
      "id": "rest-001",
      "name": "Chi nhánh Nguyễn Huệ",
      "address": "123 Nguyễn Huệ, HCMC"
    }
  ],
  "total": 1
}
```

---

### 6.5 Test Missing Tenant Header

**Request** (Không gửi X-Tenant-ID):
```bash
curl -X GET http://localhost:8000/api/v1/restaurants
```

**Kết quả mong đợi** (401 Unauthorized):
```json
{
  "detail": "X-Tenant-ID header is required"
}
```

---

## Database Inspection

### 7.1 Kiểm tra data trong PostgreSQL

```bash
psql -h localhost -U postgres -d s2o_db
```

**SQL Queries**:

```sql
-- Xem tất cả tenants
SELECT id, business_name, phone FROM tenant;

-- Xem tất cả users
SELECT id, username, email, role, tenant_id FROM "user";

-- Xem tất cả restaurants
SELECT id, name, phone, tenant_id FROM restaurant;

-- Xem tất cả orders
SELECT id, restaurant_id, customer_id, status, total_price, tenant_id FROM "order";

-- Xem chi tiết order
SELECT * FROM order_detail WHERE order_id = 'order-001';

-- Xem history status changes
SELECT id, order_id, old_status, new_status, changed_at FROM order_status_history;

-- Count orders by status
SELECT status, COUNT(*) as count FROM "order" GROUP BY status;

-- Xem data của Tenant 1 vs Tenant 2
SELECT tenant_id, COUNT(*) as total_orders FROM "order" GROUP BY tenant_id;
```

---

## Redis Monitoring

### 8.1 Monitor Redis Pub/Sub

```bash
redis-cli
```

**Trong Redis CLI**:

```
SUBSCRIBE orders:tenant-001
```

Lúc này sẽ chờ messages từ channel `orders:tenant-001`

**Khi bạn update order**, Redis sẽ nhận được message:

```
1) "message"
2) "orders:tenant-001"
3) "{\"event\": \"order_status_changed\", \"order_id\": \"order-001\", \"status\": \"preparing\"}"
```

---

## Load Testing Workflow

### 9.1 Tạo 10 Orders cùng lúc

**Script bash**:

```bash
#!/bin/bash

for i in {1..10}; do
  curl -X POST http://localhost:8000/api/v1/orders \
    -H "Content-Type: application/json" \
    -H "X-Tenant-ID: tenant-001" \
    -d "{
      \"restaurant_id\": \"rest-001\",
      \"customer_id\": \"customer-00$i\",
      \"table_number\": $i,
      \"total_price\": 210000,
      \"order_details\": [
        {
          \"menu_item_id\": \"menu-001\",
          \"quantity\": 1,
          \"unit_price\": 35000
        }
      ]
    }" &
done

wait
echo "All 10 orders created!"
```

---

### 9.2 Update tất cả orders sang status "preparing"

```bash
#!/bin/bash

for i in {1..10}; do
  curl -X PATCH http://localhost:8000/api/v1/orders/order-00$i \
    -H "Content-Type: application/json" \
    -H "X-Tenant-ID: tenant-001" \
    -d '{"status": "preparing"}' &
done

wait
echo "All orders updated to preparing!"
```

---

## Troubleshooting

### Problem 1: "X-Tenant-ID header is required"

**Giải pháp**: Luôn thêm header `-H "X-Tenant-ID: tenant-001"` vào mỗi request

---

### Problem 2: WebSocket không kết nối

**Kiểm tra**:
```bash
curl http://localhost:8000/health
```

Nếu response là lỗi, services chưa sẵn sàng

---

### Problem 3: PostgreSQL Connection Error

**Kiểm tra**:
```bash
docker logs cong-nghe-postgres
```

**Restart PostgreSQL**:
```bash
docker-compose restart postgres
```

---

### Problem 4: Order không xuất hiện

**Nguyên nhân**: Khác tenant ID khi tạo và khi query

**Giải pháp**: Đảm bảo X-Tenant-ID thống nhất

---

## Summary

Với hướng dẫn này, bạn có thể:

✅ CRUD Users (Customer, Admin, Staff)
✅ CRUD Restaurants
✅ CRUD Menu Items
✅ Test đầy đủ workflow đặt hàng từ pending → completed
✅ Test real-time updates qua WebSocket
✅ Test multi-tenancy isolation
✅ Monitor dữ liệu trong PostgreSQL và Redis

**Happy Testing! 🚀**
