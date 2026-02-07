from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.context import set_tenant_id, clear_tenant_id
class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)
        public_paths = ["/docs", "/openapi.json", "/health", "/favicon.ico", "/api/v1/users", "/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/me", "/api/v1/public", "/api/v1/admin", "/api/v1/table-requests", "/api/v1/orders/my-orders", "/uploads"]
        if any(request.url.path.startswith(path) for path in public_paths):
            return await call_next(request)
        tenant_id = request.headers.get("X-Tenant-ID")
        if not tenant_id:
            return JSONResponse(
                status_code=401,
                content={"detail": "X-Tenant-ID header is required"}
            )
        set_tenant_id(tenant_id)
        try:
            response = await call_next(request)
            return response
        finally:
            clear_tenant_id()