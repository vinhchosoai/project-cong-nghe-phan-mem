import asyncio
import uuid
from app.db.session import AsyncSessionLocal
from app.services.restaurant_service import RestaurantService, CategoryService, MenuItemService, RestaurantTableService
from app.services.table_request_service import TableRequestService
from app.services.menu_service import OrderService, InvoiceService
from app.models.models import User, Restaurant, Tenant
from app.core.context import set_tenant_id
async def verify_staff_features():
    async with AsyncSessionLocal() as db:
        try:
            print("Starting Staff Features Verification...")
            print("Setting up test data...")
            owner_id = f"owner-{uuid.uuid4().hex[:12]}"
            tenant_id = f"tenant-{uuid.uuid4().hex[:12]}"
            owner = User(
                user_id=owner_id,
                username="test_owner",
                email=f"owner_{uuid.uuid4().hex[:8]}@test.com",
                password_hash="hashed_pw",
                role="restaurant_owner"
            )
            db.add(owner)
            await db.commit()
            tenant = Tenant(tenant_id=tenant_id, user_id=owner_id)
            db.add(tenant)
            await db.commit()
            set_tenant_id(tenant_id)
            restaurant_service = RestaurantService(db)
            restaurant = await restaurant_service.create_restaurant(name="Staff Test Restaurant")
            restaurant_id = restaurant.restaurant_id
            print(f"Created Restaurant: {restaurant_id}")
            category_service = CategoryService(db)
            category = await category_service.create_category(restaurant_id, "Test Category")
            menu_service = MenuItemService(db)
            item = await menu_service.create_menu_item(category.category_id, "Test Item", 10.0)
            print(f"Created Menu Item: {item.item_id}, Available: {item.is_available}")
            table_service = RestaurantTableService(db)
            table = await table_service.create_table(restaurant_id, 1)
            print(f"Created Table: {table.table_id} (Number 1)")
            print("\n--- Test 1: Menu Availability ---")
            updated_item = await menu_service.update_menu_item(item.item_id, is_available=False)
            print(f"Updated Item Availability: {updated_item.is_available}")
            if not updated_item.is_available:
                print("SUCCESS: Item marked as unavailable.")
            else:
                print("FAILURE: Item still available.")
            print("\n--- Test 2: Table Requests ---")
            req_service = TableRequestService(db)
            req_data = {"table_id": table.table_id, "request_type": "call_server"}
            request = await req_service.create_request(restaurant_id, req_data)
            print(f"Created Request: {request.request_id}, Status: {request.status}")
            requests = await req_service.get_restaurant_requests(restaurant_id, status="pending")
            print(f"Pending Requests Count: {len(requests)}")
            if len(requests) > 0 and requests[0].request_id == request.request_id:
                print("SUCCESS: Request found in pending list.")
            else:
                print("FAILURE: Request not found.")
            updated_req = await req_service.update_status(request.request_id, "completed")
            print(f"Updated Request Status: {updated_req.status}")
            if updated_req.status == "completed":
                print("SUCCESS: Request completed.")
            else:
                print("FAILURE: Request status mismatch.")
            print("\n--- Test 3: Payment & Order Completion ---")
            order_service = OrderService(db)
            invoice_service = InvoiceService(db)
            order_items = [{"item_id": item.item_id, "quantity": 2, "unit_price": 10.0}]
            order = await order_service.create_order(restaurant_id, order_items, table_id=table.table_id)
            print(f"Created Order: {order.order_id}, Status: {order.status}")
            invoice = await invoice_service.create_invoice(
                order_id=order.order_id,
                payment_method="cash",
                amount_paid=20.0
            )
            print(f"Created Invoice: {invoice.invoice_id}")
            updated_order = await order_service.get_order(order.order_id)
            print(f"Order Status after Invoice: {updated_order.status}")
            if updated_order.status == "COMPLETED":
                print("SUCCESS: Order marked as COMPLETED.")
            else:
                print(f"FAILURE: Order status is {updated_order.status}.")
        except Exception as e:
            print(f"An error occurred: {e}")
            import traceback
            traceback.print_exc()
if __name__ == "__main__":
    asyncio.run(verify_staff_features())