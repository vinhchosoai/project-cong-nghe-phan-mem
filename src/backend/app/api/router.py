from fastapi import APIRouter
from app.api.endpoints import restaurants

api_router = APIRouter()
api_router.include_router(restaurants.router, prefix="/restaurants", tags=["restaurants"])