from fastapi import APIRouter
from app.api.endpoints import restaurants, guest_orders, menu, auth_restaurants, admin, ai, customer

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth_restaurants.router, prefix="/auth", tags=["Auth"])
api_router.include_router(restaurants.router, prefix="/restaurants", tags=["restaurants"])
api_router.include_router(guest_orders.router, prefix="/guest", tags=["Guest"])
api_router.include_router(menu.router, prefix="/menu", tags=["Menu"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(customer.router, prefix="/customer", tags=["Customer"])