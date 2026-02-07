from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.ingredient_schemas import IngredientCreate, IngredientUpdate, IngredientResponse
from app.services.ingredient_service import IngredientService
from typing import List
router = APIRouter(prefix="/api/v1/ingredients", tags=["Ingredients"])
@router.post("", response_model=IngredientResponse)
async def create_ingredient(data: IngredientCreate, db: AsyncSession = Depends(get_db)):
    try:
        service = IngredientService(db)
        return await service.create_ingredient(data.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/restaurant/{restaurant_id}", response_model=List[IngredientResponse])
async def list_ingredients(restaurant_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = IngredientService(db)
        return await service.list_ingredients(restaurant_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.patch("/{ingredient_id}", response_model=IngredientResponse)
async def update_ingredient(ingredient_id: str, data: IngredientUpdate, db: AsyncSession = Depends(get_db)):
    try:
        service = IngredientService(db)
        updated = await service.update_ingredient(ingredient_id, **data.dict(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Ingredient not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.delete("/{ingredient_id}")
async def delete_ingredient(ingredient_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = IngredientService(db)
        success = await service.delete_ingredient(ingredient_id)
        if not success:
            raise HTTPException(status_code=404, detail="Ingredient not found")
        return {"message": "Ingredient deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))