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
app.include_router(orders_router, prefix="/api/v1")
app.include_router(websocket_router)


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
