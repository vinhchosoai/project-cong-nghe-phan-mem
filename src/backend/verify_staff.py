import asyncio
import uuid
from app.db.session import AsyncSessionLocal
from app.services.staff_service import StaffService
from app.models.models import User, Restaurant, Tenant, Staff
from app.core.context import set_tenant_id
async def verify_staff():
    async with AsyncSessionLocal() as db:
        try:
            print("Starting Staff Management Verification...")
            print("Setting up test data...")
            owner_id = f"owner-{uuid.uuid4().hex[:12]}"
            owner = User(
                user_id=owner_id,
                username="rest_owner",
                email=f"owner_{uuid.uuid4().hex[:8]}@test.com",
                password_hash="hashed_password",
                role="restaurant_owner"
            )
            db.add(owner)
            tenant_id = f"tenant-{uuid.uuid4().hex[:12]}"
            tenant = Tenant(tenant_id=tenant_id, user_id=owner_id)
            db.add(tenant)
            restaurant_id = f"rest-{uuid.uuid4().hex[:12]}"
            restaurant = Restaurant(
                restaurant_id=restaurant_id,
                tenant_id=tenant_id,
                name="Test Restaurant",
                status=True
            )
            db.add(restaurant)
            await db.commit()
            print("Test data setup complete.")
            set_tenant_id(tenant_id)
            print("Testing Create Staff...")
            service = StaffService(db)
            staff_data = {
                "username": "chef_john",
                "email": f"chef_{uuid.uuid4().hex[:8]}@test.com",
                "password": "password123",
                "role": "chef"
            }
            new_staff = await service.create_staff(restaurant_id, staff_data)
            print(f"Created Staff: {new_staff.staff_id}, User: {new_staff.user_id}, Role: {new_staff.role}")
            from app.repositories.staff import StaffRepository
            repo = StaffRepository(db)
            all_staff = await repo.get_by_restaurant(restaurant_id)
            print(f"Fetched {len(all_staff)} staff members for restaurant.")
            if len(all_staff) == 1:
                s = all_staff[0]
                if s.user:
                    print(f"Verified Staff: {s.user.username} ({s.user.email}) - {s.role}")
                    print(f"User loaded: {s.user.username}")
                else:
                    print("FAILURE: User relationship not loaded!")
                    print(f"Verified Staff (No User Data): ID={s.staff_id} - {s.role}")
            else:
                print("FAILURE: Expected 1 staff member.")
            print("Testing Update Role...")
            updated_staff = await service.update_staff_role(new_staff.staff_id, "manager")
            print(f"Updated Role to: {updated_staff.role}")
            from app.repositories.user import UserRepository
            user_repo = UserRepository(db)
            staff_user = await user_repo.get(updated_staff.user_id)
            if staff_user.role == "manager":
                print("SUCCESS: User role also updated to manager.")
            else:
                print(f"FAILURE: User role is {staff_user.role}, expected manager.")
            print("Testing Remove Staff...")
            await service.remove_staff(new_staff.staff_id)
            remaining_staff = await repo.get_by_restaurant(restaurant_id)
            if len(remaining_staff) == 0:
                print("SUCCESS: Staff removed.")
            else:
                print(f"FAILURE: Staff still exists ({len(remaining_staff)} found).")
            user_check = await user_repo.get(new_staff.user_id)
            if user_check is None:
                print("SUCCESS: User account also removed.")
            else:
                print("WARNING: User account still exists (Is this intended? Service deletes it).")
        except Exception as e:
            print(f"An error occurred: {e}")
            import traceback
            traceback.print_exc()
if __name__ == "__main__":
    asyncio.run(verify_staff())