from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.session import get_db
from ..services.user_service import UserService
from ..schemas.schemas import UserCreate, UserUpdate, UserResponse, UserListResponse, UserLogin
from ..core.exceptions import ConflictException, NotFoundException
router = APIRouter(prefix="/api/v1/users", tags=["users"])
@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    try:
        user = await service.create_user(
            username=user_data.username,
            email=user_data.email,
            phone_number=user_data.phone_number,
            password=user_data.password
        )
        return user
    except ConflictException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    try:
        user = await service.get_user_by_id(user_id)
        return user
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
@router.get("", response_model=UserListResponse)
async def list_users(skip: int = 0, limit: int = 10, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    users, total = await service.list_users(skip=skip, limit=limit)
    return {
        "items": users,
        "total": total,
        "skip": skip,
        "limit": limit
    }
@router.get("/search/{search_term}", response_model=UserListResponse)
async def search_users(search_term: str, skip: int = 0, limit: int = 10, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    users, total = await service.search_users(search_term=search_term, skip=skip, limit=limit)
    return {
        "items": users,
        "total": total,
        "skip": skip,
        "limit": limit
    }
@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user_data: UserUpdate, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    try:
        updated_user = await service.update_user(
            user_id=user_id,
            email=user_data.email,
            phone_number=user_data.phone_number,
            password=user_data.password
        )
        return updated_user
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ConflictException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    try:
        await service.delete_user(user_id)
        return None
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
@router.post("/login", response_model=UserResponse)
async def login(credentials: UserLogin, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    try:
        user = await service.authenticate_user(
            username=credentials.username,
            password=credentials.password
        )
        return user
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))