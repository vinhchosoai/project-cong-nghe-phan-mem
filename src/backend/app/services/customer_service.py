from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.crud.crud_user import user
from app.models.user import User
from app.models.order import Order
from app.schemas.enums import MembershipTier
from app.core.exeptions import ResourceNotFoundException, BusinessLogicException


class CustomerService:
    """Service for customer-related operations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = user

    def get_customer_profile(self, customer_id: UUID) -> Optional[dict]:
        """Get customer profile with stats"""
        db_user = self.user_repo.get(self.db, customer_id)
        if not db_user:
            raise ResourceNotFoundException(f"Customer {customer_id} not found")

        # Get order history
        orders = self.db.query(Order).filter(Order.user_id == customer_id).all()
        
        total_spent = sum(order.total_amount for order in orders)
        order_count = len(orders)

        return {
            "id": str(db_user.id),
            "email": db_user.email,
            "full_name": db_user.full_name,
            "phone_number": db_user.phone_number,
            "avatar_url": db_user.avatar_url,
            "membership_tier": db_user.membership_tier.value,
            "points": db_user.points,
            "total_spent": total_spent,
            "total_orders": order_count,
            "created_at": db_user.created_at.isoformat() if db_user.created_at else None
        }

    def get_order_history(
        self,
        customer_id: UUID,
        limit: int = 10
    ) -> List[dict]:
        """Get customer's order history"""
        db_user = self.user_repo.get(self.db, customer_id)
        if not db_user:
            raise ResourceNotFoundException(f"Customer {customer_id} not found")

        orders = self.db.query(Order).filter(
            Order.user_id == customer_id
        ).order_by(Order.created_at.desc()).limit(limit).all()

        return [
            {
                "id": str(order.id),
                "restaurant_id": str(order.restaurant_id),
                "status": order.status.value,
                "total_amount": order.total_amount,
                "created_at": order.created_at.isoformat() if order.created_at else None,
                "item_count": len(order.items)
            }
            for order in orders
        ]

    def add_loyalty_points(
        self,
        customer_id: UUID,
        points: int,
        reason: str
    ) -> int:
        """Add loyalty points to customer"""
        db_user = self.user_repo.get(self.db, customer_id)
        if not db_user:
            raise ResourceNotFoundException(f"Customer {customer_id} not found")

        if points <= 0:
            raise BusinessLogicException("Points must be greater than zero")

        db_user.points += points
        self.db.commit()
        self.db.refresh(db_user)
        
        return db_user.points

    def redeem_points(
        self,
        customer_id: UUID,
        points: int
    ) -> int:
        """Redeem loyalty points"""
        db_user = self.user_repo.get(self.db, customer_id)
        if not db_user:
            raise ResourceNotFoundException(f"Customer {customer_id} not found")

        if points <= 0:
            raise BusinessLogicException("Points must be greater than zero")

        if db_user.points < points:
            raise BusinessLogicException(
                f"Insufficient points. Available: {db_user.points}, Requested: {points}"
            )

        db_user.points -= points
        self.db.commit()
        self.db.refresh(db_user)
        
        return db_user.points

    def upgrade_membership_tier(
        self,
        customer_id: UUID,
        new_tier: MembershipTier
    ) -> dict:
        """Upgrade customer membership tier"""
        db_user = self.user_repo.get(self.db, customer_id)
        if not db_user:
            raise ResourceNotFoundException(f"Customer {customer_id} not found")

        tier_order = [MembershipTier.IRON, MembershipTier.SILVER, MembershipTier.GOLD, MembershipTier.DIAMOND]
        
        if tier_order.index(new_tier) <= tier_order.index(db_user.membership_tier):
            raise BusinessLogicException("Can only upgrade to higher tiers")

        db_user.membership_tier = new_tier
        self.db.commit()
        self.db.refresh(db_user)
        
        return {
            "id": str(db_user.id),
            "membership_tier": db_user.membership_tier.value
        }
