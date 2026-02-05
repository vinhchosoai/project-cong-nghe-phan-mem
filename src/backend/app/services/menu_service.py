from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import Order, OrderDetail, Invoice, Customer, Reservation
from app.core.context import get_tenant_id
from uuid import uuid4
from decimal import Decimal


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_order(self, restaurant_id: str, items: list, customer_id: str = None, table_id: str = None) -> Order:
        tenant_id = get_tenant_id()
        total_amount = sum(Decimal(str(item['unit_price'] * item['quantity'])) for item in items)
        
        order = Order(
            order_id=f"ord-{uuid4().hex[:12]}",
            tenant_id=tenant_id,
            restaurant_id=restaurant_id,
            customer_id=customer_id,
            table_id=table_id,
            status="PENDING",
            total_amount=total_amount,
        )
        self.db.add(order)
        await self.db.flush()

        for item_data in items:
            order_detail = OrderDetail(
                order_detail_id=f"odtl-{uuid4().hex[:12]}",
                tenant_id=tenant_id,
                restaurant_id=restaurant_id,
                order_id=order.order_id,
                item_id=item_data['item_id'],
                quantity=item_data['quantity'],
                unit_price=Decimal(str(item_data['unit_price'])),
                note=item_data.get('note'),
            )
            self.db.add(order_detail)

        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def get_order(self, order_id: str) -> Order:
        tenant_id = get_tenant_id()
        result = await self.db.execute(
            select(Order).where(
                (Order.order_id == order_id) & 
                (Order.tenant_id == tenant_id)
            )
        )
        return result.scalar_one_or_none()

    async def list_orders(self, restaurant_id: str, skip: int = 0, limit: int = 50):
        tenant_id = get_tenant_id()
        result = await self.db.execute(
            select(Order).where(
                (Order.restaurant_id == restaurant_id) & 
                (Order.tenant_id == tenant_id)
            ).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def get_orders_by_customer(self, customer_id: str, skip: int = 0, limit: int = 50):
        tenant_id = get_tenant_id()
        result = await self.db.execute(
            select(Order).where(
                (Order.customer_id == customer_id) & 
                (Order.tenant_id == tenant_id)
            ).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def get_orders_by_status(self, restaurant_id: str, status: str, skip: int = 0, limit: int = 50):
        tenant_id = get_tenant_id()
        result = await self.db.execute(
            select(Order).where(
                (Order.restaurant_id == restaurant_id) & 
                (Order.status == status) & 
                (Order.tenant_id == tenant_id)
            ).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def update_order_status(self, order_id: str, status: str) -> Order:
        order = await self.get_order(order_id)
        if not order:
            return None
        order.status = status
        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def delete_order(self, order_id: str) -> bool:
        order = await self.get_order(order_id)
        if not order:
            return False
        await self.db.delete(order)
        await self.db.commit()
        return True


class InvoiceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_invoice(self, order_id: str, payment_method: str, amount_paid: float, customer_id: str = None) -> Invoice:
        tenant_id = get_tenant_id()
        order = await self.db.get(Order, order_id)
        if not order:
            return None

        invoice = Invoice(
            invoice_id=f"inv-{uuid4().hex[:12]}",
            tenant_id=tenant_id,
            restaurant_id=order.restaurant_id,
            customer_id=customer_id,
            order_id=order_id,
            payment_method=payment_method,
            amount_paid=Decimal(str(amount_paid)),
        )
        self.db.add(invoice)
        await self.db.commit()
        await self.db.refresh(invoice)
        return invoice

    async def get_invoice(self, invoice_id: str) -> Invoice:
        tenant_id = get_tenant_id()
        result = await self.db.execute(
            select(Invoice).where(
                (Invoice.invoice_id == invoice_id) & 
                (Invoice.tenant_id == tenant_id)
            )
        )
        return result.scalar_one_or_none()

    async def list_invoices(self, restaurant_id: str, skip: int = 0, limit: int = 50):
        tenant_id = get_tenant_id()
        result = await self.db.execute(
            select(Invoice).where(
                (Invoice.restaurant_id == restaurant_id) & 
                (Invoice.tenant_id == tenant_id)
            ).offset(skip).limit(limit)
        )
        return result.scalars().all()


class CustomerService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_customer(self, user_id: str, membership_tier: str = "IRON") -> Customer:
        customer = Customer(
            customer_id=f"cust-{uuid4().hex[:12]}",
            user_id=user_id,
            membership_tier=membership_tier,
            current_points=0,
        )
        self.db.add(customer)
        await self.db.commit()
        await self.db.refresh(customer)
        return customer

    async def get_customer(self, customer_id: str) -> Customer:
        return await self.db.get(Customer, customer_id)

    async def get_customer_by_user(self, user_id: str) -> Customer:
        result = await self.db.execute(
            select(Customer).where(Customer.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def update_customer(self, customer_id: str, **kwargs) -> Customer:
        customer = await self.get_customer(customer_id)
        if not customer:
            return None
        for key, value in kwargs.items():
            if hasattr(customer, key) and value is not None:
                setattr(customer, key, value)
        await self.db.commit()
        await self.db.refresh(customer)
        return customer

    async def add_loyalty_points(self, customer_id: str, points: int) -> Customer:
        customer = await self.get_customer(customer_id)
        if not customer:
            return None
        customer.current_points += points
        await self.db.commit()
        await self.db.refresh(customer)
        return customer


class ReservationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_reservation(self, restaurant_id: str, booking_time, guest_count: int, 
                                 table_id: str = None, customer_id: str = None) -> Reservation:
        tenant_id = get_tenant_id()
        reservation = Reservation(
            reservation_id=f"res-{uuid4().hex[:12]}",
            tenant_id=tenant_id,
            restaurant_id=restaurant_id,
            table_id=table_id,
            customer_id=customer_id,
            booking_time=booking_time,
            guest_count=guest_count,
            status="PENDING",
        )
        self.db.add(reservation)
        await self.db.commit()
        await self.db.refresh(reservation)
        return reservation

    async def get_reservation(self, reservation_id: str) -> Reservation:
        tenant_id = get_tenant_id()
        result = await self.db.execute(
            select(Reservation).where(
                (Reservation.reservation_id == reservation_id) & 
                (Reservation.tenant_id == tenant_id)
            )
        )
        return result.scalar_one_or_none()

    async def list_reservations(self, restaurant_id: str, skip: int = 0, limit: int = 50):
        tenant_id = get_tenant_id()
        result = await self.db.execute(
            select(Reservation).where(
                (Reservation.restaurant_id == restaurant_id) & 
                (Reservation.tenant_id == tenant_id)
            ).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def update_reservation(self, reservation_id: str, **kwargs) -> Reservation:
        reservation = await self.get_reservation(reservation_id)
        if not reservation:
            return None
        for key, value in kwargs.items():
            if hasattr(reservation, key) and value is not None:
                setattr(reservation, key, value)
        await self.db.commit()
        await self.db.refresh(reservation)
        return reservation

    async def cancel_reservation(self, reservation_id: str) -> Reservation:
        return await self.update_reservation(reservation_id, status="CANCELLED")
