from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.middleware import TenantMiddleware
from app.core.exeptions import ApplicationException

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    version="1.0.0",
    description="S2O Smart Restaurant Management Platform - Multi-tenant SaaS"
)

# Add CORS middleware first
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Add tenant middleware for multi-tenancy
app.add_middleware(TenantMiddleware)


# Exception handlers
@app.exception_handler(ApplicationException)
async def application_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "error": "VALIDATION_ERROR",
            "message": "Request validation failed",
            "details": exc.errors()
        }
    )


# Include routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Welcome to S2O Smart Restaurant Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)