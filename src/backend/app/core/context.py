from contextvars import ContextVar
from typing import Optional
tenant_id_var: ContextVar[Optional[str]] = ContextVar('tenant_id', default=None)
def get_tenant_id() -> Optional[str]:
    return tenant_id_var.get()
def set_tenant_id(tenant_id: str) -> None:
    tenant_id_var.set(tenant_id)
def clear_tenant_id() -> None:
    tenant_id_var.set(None)