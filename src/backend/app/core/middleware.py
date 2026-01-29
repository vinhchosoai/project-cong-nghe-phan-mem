from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.context import set_tenant_id, clear_tenant_id
from app.core.exceptions import UnauthorizedException


class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        public_paths = ["/docs", "/openapi.json", "/health", "/favicon.ico", "/api/v1/users"]
    
        if any(request.url.path.startswith(path) for path in public_paths):
            return await call_next(request)
        tenant_id = request.headers.get("X-Tenant-ID")

        if not tenant_id:
            raise UnauthorizedException("X-Tenant-ID header is required")

        set_tenant_id(tenant_id)

        try:
            response = await call_next(request)
        finally:
            clear_tenant_id()

        return response
