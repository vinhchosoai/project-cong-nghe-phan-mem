from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.crud.crud_order import payment
from app.models.order import Payment, Order
from app.schemas.enums import PaymentMethod
from app.core.exeptions import BusinessLogicException, ResourceNotFoundException


class PaymentService:
    def __init__(self, db: Session):
        self.db = db
        self.payment_repo = payment

    def create_payment(
        self,
        order_id: UUID,
        amount: float,
        payment_method: PaymentMethod,
        transaction_id: Optional[str] = None
    ) -> Payment:
        """Create a payment record"""
        if amount <= 0:
            raise BusinessLogicException("Payment amount must be greater than zero")

        db_payment = Payment(
            order_id=order_id,
            amount=amount,
            payment_method=payment_method,
            transaction_id=transaction_id,
            status="PENDING"
        )
        self.db.add(db_payment)
        self.db.commit()
        self.db.refresh(db_payment)
        return db_payment

    def get_payment(self, payment_id: UUID) -> Optional[Payment]:
        """Get a payment record"""
        return self.payment_repo.get(self.db, payment_id)

    def get_order_payment(self, order_id: UUID) -> Optional[Payment]:
        """Get payment for an order"""
        return self.payment_repo.get_by_order(self.db, order_id)

    def confirm_payment(
        self,
        payment_id: UUID,
        transaction_id: Optional[str] = None
    ) -> Payment:
        """Confirm a payment"""
        db_payment = self.get_payment(payment_id)
        if not db_payment:
            raise ResourceNotFoundException(f"Payment {payment_id} not found")

        db_payment.status = "COMPLETED"
        if transaction_id:
            db_payment.transaction_id = transaction_id

        self.db.commit()
        self.db.refresh(db_payment)
        return db_payment

    def cancel_payment(self, payment_id: UUID) -> Payment:
        """Cancel a payment"""
        db_payment = self.get_payment(payment_id)
        if not db_payment:
            raise ResourceNotFoundException(f"Payment {payment_id} not found")

        if db_payment.status == "COMPLETED":
            raise BusinessLogicException("Cannot cancel a completed payment")

        db_payment.status = "CANCELLED"
        self.db.commit()
        self.db.refresh(db_payment)
        return db_payment
