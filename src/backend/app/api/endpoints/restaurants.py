from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.schemas import restaurant as schemas
# from app.api import deps
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.RestaurantResponse])
def read_restaurants(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    restaurants = crud.restaurant.get_multi(db, skip=skip, limit=limit)
    return restaurants

@router.post("/", response_model=schemas.RestaurantResponse)
def create_restaurant(
    *,
    db: Session = Depends(get_db),
    restaurant_in: schemas.RestaurantCreate,
) -> Any:
    restaurant = crud.restaurant.create(db=db, obj_in=restaurant_in)
    return restaurant

@router.get("/{restaurant_id}", response_model=schemas.RestaurantResponse)
def read_restaurant(
    *,
    db: Session = Depends(get_db),
    restaurant_id: str,
) -> Any:
    restaurant = crud.restaurant.get(db=db, id=restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@router.put("/{restaurant_id}", response_model=schemas.RestaurantResponse)
def update_restaurant(
    *,
    db: Session = Depends(get_db),
    restaurant_id: str,
    restaurant_in: schemas.RestaurantUpdate,
) -> Any:
    """
    Update a restaurant.
    """
    restaurant = crud.restaurant.get(db=db, id=restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    restaurant = crud.restaurant.update(db=db, db_obj=restaurant, obj_in=restaurant_in)
    return restaurant

@router.delete("/{restaurant_id}", response_model=schemas.RestaurantResponse)
def delete_restaurant(
    *,
    db: Session = Depends(get_db),
    restaurant_id: str,
) -> Any:
    """
    Delete a restaurant.
    """
    restaurant = crud.restaurant.get(db=db, id=restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    restaurant = crud.restaurant.remove(db=db, id=restaurant_id)
    return restaurant