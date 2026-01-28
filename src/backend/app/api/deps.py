from typing import Generator
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, Header
from uuid import UUID

from app.db.session import get_db
from app.crud.crud_user import user as user_crud
from app.schemas.enums import UserRole
from app.core.security import decode_access_token


def get_current_user(
    db: Session = Depends(get_db),
    authorization: str = Header(None)
) -> dict:
    """Get current authenticated user from token"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is missing"
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError
    except (ValueError, IndexError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    db_user = user_crud.get(db, user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive"
        )
    
    return {
        "id": str(db_user.id),
        "email": db_user.email,
        "role": db_user.role,
        "restaurant_id": str(db_user.restaurant_id) if db_user.restaurant_id else None
    }


def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    """Verify user has admin role"""
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this resource"
        )
    return current_user


def get_restaurant_manager(current_user: dict = Depends(get_current_user)) -> dict:
    """Verify user is a restaurant manager"""
    if current_user["role"] not in [UserRole.ADMIN, UserRole.RESTAURANT_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only restaurant managers can access this resource"
        )
    return current_user


def get_tenant_id_from_header(x_tenant_id: str = Header(...)) -> UUID:
    """Extract and validate tenant ID from header"""
    try:
        return UUID(x_tenant_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tenant ID format"
        )
