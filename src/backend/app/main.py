from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.middleware import TenantMiddleware
from app.core.exceptions import AppException
from app.db.session import init_db, close_db
from app.websockets.broadcaster import broadcaster
from app.api.orders import router as orders_router
from app.api.websocket import router as websocket_router
from app.api.users import router as users_router
from app.api.auth import router as auth_router
from app.api.restaurant import router as restaurant_router
from app.api.menu import router as menu_router
from app.api.ai import router as ai_router
from app.api.admin import router as admin_router
import logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await broadcaster.connect()
    logger.info("Application startup complete")
    yield
    await close_db()
    await broadcaster.disconnect()
    logger.info("Application shutdown complete")


app = FastAPI(
    title="S2O - Smart Restaurant Management Platform",
    description="Backend API for restaurant management system",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TenantMiddleware)

app.include_router(users_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(orders_router, prefix="/api/v1")
app.include_router(websocket_router)
app.include_router(restaurant_router)
app.include_router(menu_router)
app.include_router(ai_router)
from app.api.public_menu import router as public_menu_router
app.include_router(public_menu_router)
from app.api.ingredient import router as ingredient_router
app.include_router(ingredient_router)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "environment": settings.environment}


@app.get("/", tags=["Root"])
async def root():
    return {"message": "S2O Restaurant Management API"}
