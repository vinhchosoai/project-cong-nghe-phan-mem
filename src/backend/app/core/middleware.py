from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager


class TenantContext:
    """Context manager for tenant-scoped operations"""
    def __init__(self):
        self._tenant_id: str = None

    @property
    def tenant_id(self) -> str:
        if self._tenant_id is None:
            raise ValueError("Tenant ID not set")
        return self._tenant_id

    @tenant_id.setter
    def tenant_id(self, value: str):
        self._tenant_id = value

    def clear(self):
        self._tenant_id = None


# Global tenant context
tenant_context = TenantContext()


class TenantMiddleware(BaseHTTPMiddleware):
    """
    Middleware to extract tenant ID from X-Tenant-ID header
    and validate it for each request
    """
    
    # Public endpoints that don't require tenant ID
    PUBLIC_ENDPOINTS = [
        "/",
        "/health",
        "/docs",
        "/openapi.json",
        "/redoc",
        "/docs/oauth2-redirect"
    ]
    
    async def dispatch(self, request: Request, call_next):
        # Skip validation for public endpoints
        if request.url.path in self.PUBLIC_ENDPOINTS:
            return await call_next(request)
        
        # Extract tenant ID from header
        tenant_id = request.headers.get("X-Tenant-ID")
        
        # For auth endpoints that don't require tenant ID
        if request.url.path.startswith("/api/v1/auth"):
            if tenant_id:
                request.state.tenant_id = tenant_id
                tenant_context.tenant_id = tenant_id
            response = await call_next(request)
            tenant_context.clear()
            return response
        
        # For guest/public endpoints that don't require authentication
        if request.url.path.startswith("/api/v1/guest"):
            if tenant_id:
                request.state.tenant_id = tenant_id
                tenant_context.tenant_id = tenant_id
            response = await call_next(request)
            tenant_context.clear()
            return response
        
        # For protected endpoints, tenant ID is required
        if not tenant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Tenant-ID header is missing or invalid"
            )
        
        # Store tenant ID in request state for access in endpoints
        request.state.tenant_id = tenant_id
        tenant_context.tenant_id = tenant_id
        
        try:
            response = await call_next(request)
        finally:
            tenant_context.clear()
        
        return response
