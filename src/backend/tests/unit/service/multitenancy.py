import pytest
from fastapi import Request, FastAPI
from app.core.middleware import TenantMiddleware
from starlette.testclient import TestClient

def test_tenant_middleware_extracts_header():
    app = FastAPI()
    app.add_middleware(TenantMiddleware)

    @app.get("/test-tenant")
    def endpoint(request: Request):
        return {"tenant_id": request.state.tenant_id}

    client = TestClient(app)
    headers = {"X-Tenant-ID": "rest_123"}
    
    response = client.get("/test-tenant", headers=headers)
    
    assert response.status_code == 200
    assert response.json() == {"tenant_id": "rest_123"}

def test_tenant_middleware_missing_header():
    app = FastAPI()
    app.add_middleware(TenantMiddleware)

    @app.get("/test-tenant")
    def endpoint():
        return {"msg": "ok"}

    client = TestClient(app)
    
    response = client.get("/test-tenant")
    
    assert response.status_code == 400
    assert "X-Tenant-ID header is missing" in response.text