from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.crud.crud_order import order, order_item, payment
from app.crud.crud_menu import menu_item
from app.models.order import Order, OrderItem, Payment
from app.models.restaurant import Table
from app.schemas.order import OrderCreate, OrderUpdateStatus, OrderItemCreate
from app.schemas.enums import OrderStatus, TableStatus
from app.core.exeptions import (
    BusinessLogicException,
    ResourceNotFoundException,
    ValidationException
)


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.order_repo = order
        self.order_item_repo = order_item
        self.payment_repo = payment
        self.menu_repo = menu_item

    def place_order(
        self,
        restaurant_id: UUID,
        table_id: UUID,
        items: List[OrderItemCreate],
        user_id: Optional[UUID] = None,
        note: Optional[str] = None
    ) -> Order:
        """Create a new order"""
        if not items:
            raise ValidationException("Order must contain at least one item")

        # Create order
        from app.models.order import Order as OrderModel
        db_order = OrderModel(
            restaurant_id=restaurant_id,
            table_id=table_id,
            user_id=user_id,
            status=OrderStatus.PENDING,
            note=note
        )
        self.db.add(db_order)
        self.db.flush()

        total_amount = 0.0

        # Add order items
        for item in items:
            menu_item_db = self.menu_repo.get_by_tenant(
                self.db,
                tenant_id=restaurant_id,
                id=item.menu_item_id
            )
            if not menu_item_db:
                raise ResourceNotFoundException(f"Menu item {item.menu_item_id} not found")

            if not menu_item_db.is_available:
                raise BusinessLogicException(f"Menu item {menu_item_db.name} is not available")

            item_total = menu_item_db.price * item.quantity
            total_amount += item_total

            order_item_db = OrderItem(
                order_id=db_order.id,
                menu_item_id=item.menu_item_id,
                quantity=item.quantity,
                unit_price=menu_item_db.price,
                total_price=item_total,
                note=item.note
            )
            self.db.add(order_item_db)

        db_order.total_amount = total_amount
        self.db.commit()
        self.db.refresh(db_order)
        return db_order

    def get_order(
        self,
        restaurant_id: UUID,
        order_id: UUID
    ) -> Optional[Order]:
        """Get a specific order"""
        return self.order_repo.get_by_tenant(
            self.db,
            tenant_id=restaurant_id,
            id=order_id
        )

    def get_order_status(
        self,
        restaurant_id: UUID,
        order_id: UUID
    ) -> dict:
        """Get order status"""
        db_order = self.get_order(restaurant_id, order_id)
        if not db_order:
            raise ResourceNotFoundException(f"Order {order_id} not found")

        return {
            "id": str(db_order.id),
            "status": db_order.status.value,
            "total_amount": db_order.total_amount,
            "created_at": db_order.created_at.isoformat() if db_order.created_at else None
        }

    def get_table_orders(
        self,
        restaurant_id: UUID,
        table_id: UUID
    ) -> List[Order]:
        """Get all orders for a table"""
        return self.order_repo.get_by_table(self.db, restaurant_id, table_id)

    def update_order_status(
        self,
        restaurant_id: UUID,
        order_id: UUID,
        status_update: OrderUpdateStatus
    ) -> Order:
        """Update order status"""
        db_order = self.get_order(restaurant_id, order_id)
        if not db_order:
            raise ResourceNotFoundException(f"Order {order_id} not found")

        # Validate status transition
        valid_transitions = {
            OrderStatus.PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            OrderStatus.CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
            OrderStatus.PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
            OrderStatus.READY: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
            OrderStatus.COMPLETED: [],
            OrderStatus.CANCELLED: []
        }

        if status_update.status not in valid_transitions.get(db_order.status, []):
            raise BusinessLogicException(
                f"Cannot transition from {db_order.status.value} to {status_update.status.value}"
            )

        db_order.status = status_update.status
        self.db.commit()
        self.db.refresh(db_order)
        return db_order

    def cancel_order(
        self,
        restaurant_id: UUID,
        order_id: UUID
    ) -> Order:
        """Cancel an order"""
        db_order = self.get_order(restaurant_id, order_id)
        if not db_order:
            raise ResourceNotFoundException(f"Order {order_id} not found")

        if db_order.status in [OrderStatus.COMPLETED, OrderStatus.CANCELLED]:
            raise BusinessLogicException(f"Cannot cancel order with status {db_order.status.value}")

        db_order.status = OrderStatus.CANCELLED
        self.db.commit()
        self.db.refresh(db_order)
        return db_order
