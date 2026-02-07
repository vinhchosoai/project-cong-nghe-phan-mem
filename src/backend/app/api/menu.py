from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.order_schemas import (
    OrderCreate, OrderResponse, OrderUpdate,
    InvoiceCreate, InvoiceResponse,
    CustomerCreate, CustomerResponse, CustomerUpdate,
    ReservationCreate, ReservationResponse, ReservationUpdate
)
from app.services.menu_service import (
    OrderService, InvoiceService, CustomerService, ReservationService
)
router = APIRouter(prefix="/api/v1", tags=["Orders and Reservations"])
@router.post("/orders", response_model=OrderResponse)
async def create_order(data: OrderCreate, db: AsyncSession = Depends(get_db)):
    try:
        service = OrderService(db)
        order = await service.create_order(
            restaurant_id=data.restaurant_id,
            items=data.items,
            customer_id=data.customer_id,
            table_id=data.table_id
        )
        return order
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = OrderService(db)
        order = await service.get_order(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/restaurants/{restaurant_id}/orders", response_model=list[OrderResponse])
async def list_orders(restaurant_id: str, skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    try:
        service = OrderService(db)
        orders = await service.list_orders(restaurant_id, skip, limit)
        return orders
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/customers/{customer_id}/orders", response_model=list[OrderResponse])
async def get_customer_orders(customer_id: str, skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    try:
        service = OrderService(db)
        orders = await service.get_orders_by_customer(customer_id, skip, limit)
        return orders
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/orders/status/{status}", response_model=list[OrderResponse])
async def get_orders_by_status(status: str, restaurant_id: str, skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    try:
        service = OrderService(db)
        orders = await service.get_orders_by_status(restaurant_id, status, skip, limit)
        return orders
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.patch("/orders/{order_id}", response_model=OrderResponse)
async def update_order(order_id: str, data: OrderUpdate, db: AsyncSession = Depends(get_db)):
    try:
        service = OrderService(db)
        if data.status:
            order = await service.update_order_status(order_id, data.status)
        else:
            order = await service.get_order(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.delete("/orders/{order_id}")
async def delete_order(order_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = OrderService(db)
        success = await service.delete_order(order_id)
        if not success:
            raise HTTPException(status_code=404, detail="Order not found")
        return {"message": "Order deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.post("/invoices", response_model=InvoiceResponse)
async def create_invoice(data: InvoiceCreate, db: AsyncSession = Depends(get_db)):
    try:
        service = InvoiceService(db)
        invoice = await service.create_invoice(
            order_id=data.order_id,
            payment_method=data.payment_method,
            amount_paid=1000,
            customer_id=data.customer_id
        )
        if not invoice:
            raise HTTPException(status_code=404, detail="Order not found")
        return invoice
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = InvoiceService(db)
        invoice = await service.get_invoice(invoice_id)
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return invoice
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/restaurants/{restaurant_id}/invoices", response_model=list[InvoiceResponse])
async def list_invoices(restaurant_id: str, skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    try:
        service = InvoiceService(db)
        invoices = await service.list_invoices(restaurant_id, skip, limit)
        return invoices
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.post("/customers", response_model=CustomerResponse)
async def create_customer(data: CustomerCreate, db: AsyncSession = Depends(get_db)):
    try:
        service = CustomerService(db)
        customer = await service.create_customer(data.user_id, data.membership_tier)
        return customer
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = CustomerService(db)
        customer = await service.get_customer(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/users/{user_id}/customer", response_model=CustomerResponse)
async def get_customer_by_user(user_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = CustomerService(db)
        customer = await service.get_customer_by_user(user_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.patch("/customers/{customer_id}", response_model=CustomerResponse)
async def update_customer(customer_id: str, data: CustomerUpdate, db: AsyncSession = Depends(get_db)):
    try:
        service = CustomerService(db)
        customer = await service.update_customer(customer_id, **data.dict(exclude_unset=True))
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.post("/customers/{customer_id}/loyalty-points")
async def add_loyalty_points(customer_id: str, points: int, db: AsyncSession = Depends(get_db)):
    try:
        service = CustomerService(db)
        customer = await service.add_loyalty_points(customer_id, points)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return {"message": f"Added {points} points", "current_points": customer.current_points}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.post("/reservations", response_model=ReservationResponse)
async def create_reservation(data: ReservationCreate, db: AsyncSession = Depends(get_db)):
    try:
        service = ReservationService(db)
        reservation = await service.create_reservation(
            restaurant_id=data.restaurant_id,
            booking_time=data.booking_time,
            guest_count=data.guest_count,
            table_id=data.table_id,
            customer_id=data.customer_id
        )
        return reservation
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/reservations/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(reservation_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = ReservationService(db)
        reservation = await service.get_reservation(reservation_id)
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        return reservation
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/restaurants/{restaurant_id}/reservations", response_model=list[ReservationResponse])
async def list_reservations(restaurant_id: str, skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    try:
        service = ReservationService(db)
        reservations = await service.list_reservations(restaurant_id, skip, limit)
        return reservations
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.patch("/reservations/{reservation_id}", response_model=ReservationResponse)
async def update_reservation(reservation_id: str, data: ReservationUpdate, db: AsyncSession = Depends(get_db)):
    try:
        service = ReservationService(db)
        reservation = await service.update_reservation(reservation_id, **data.dict(exclude_unset=True))
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        return reservation
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.delete("/reservations/{reservation_id}")
async def cancel_reservation(reservation_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = ReservationService(db)
        reservation = await service.cancel_reservation(reservation_id)
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        return {"message": "Reservation cancelled"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))