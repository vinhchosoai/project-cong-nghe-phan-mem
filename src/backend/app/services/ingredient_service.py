from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import Ingredient
from uuid import uuid4

class IngredientService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_ingredient(self, data: dict) -> Ingredient:
        ingredient = Ingredient(
            ingredient_id=f"ing-{uuid4().hex[:12]}",
            restaurant_id=data["restaurant_id"],
            name=data["name"],
            quantity=data["quantity"],
            unit=data["unit"],
            is_available=data.get("is_available", True)
        )
        self.db.add(ingredient)
        await self.db.commit()
        await self.db.refresh(ingredient)
        return ingredient

    async def get_ingredient(self, ingredient_id: str) -> Ingredient:
        return await self.db.get(Ingredient, ingredient_id)

    async def list_ingredients(self, restaurant_id: str):
        result = await self.db.execute(
            select(Ingredient).where(Ingredient.restaurant_id == restaurant_id)
        )
        return result.scalars().all()

    async def update_ingredient(self, ingredient_id: str, **kwargs) -> Ingredient:
        ingredient = await self.get_ingredient(ingredient_id)
        if not ingredient:
            return None
        
        for key, value in kwargs.items():
            if hasattr(ingredient, key) and value is not None:
                setattr(ingredient, key, value)
                
        await self.db.commit()
        await self.db.refresh(ingredient)
        return ingredient

    async def delete_ingredient(self, ingredient_id: str) -> bool:
        ingredient = await self.get_ingredient(ingredient_id)
        if not ingredient:
            return False
        await self.db.delete(ingredient)
        await self.db.commit()
        return True
