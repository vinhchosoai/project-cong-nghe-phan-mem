from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.crud.base import CRUDTenantBase, CRUDBase
from app.models.order import Order, OrderItem, Payment
from app.models.restaurant import Table
from app.schemas.order import OrderCreate, OrderUpdateStatus

class CRUDOrder(CRUDTenantBase[Order, OrderCreate, OrderUpdateStatus]):
    def get_by_table(
        self,
        db: Session,
        tenant_id: UUID,
        table_id: UUID
    ) -> List[Order]:
        return db.query(self.model).filter(
            self.model.restaurant_id == tenant_id,
            self.model.table_id == table_id
        ).order_by(self.model.created_at.desc()).all()

class CRUDOrderItem(CRUDBase[OrderItem, dict, dict]):
    pass

class CRUDPayment(CRUDBase[Payment, dict, dict]):
    def get_by_order(self, db: Session, order_id: UUID) -> Optional[Payment]:
        return db.query(self.model).filter(self.model.order_id == order_id).first()

class CRUDTable(CRUDTenantBase[Table, dict, dict]):
    pass

order = CRUDOrder(Order, tenant_field="restaurant_id")
order_item = CRUDOrderItem(OrderItem)
payment = CRUDPayment(Payment)
table = CRUDTable(Table, tenant_field="restaurant_id")
