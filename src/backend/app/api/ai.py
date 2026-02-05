from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.ai_schemas import ChatMessageCreate, ChatMessageResponse, RecommendationRequest, RecommendationResponse
from app.services.ai_service import AIService
from app.models.models import MenuItem
from sqlalchemy import select

router = APIRouter(prefix="/api/v1/ai", tags=["AI Features"])


@router.post("/chat", response_model=ChatMessageResponse)
async def chat_with_ai(data: ChatMessageCreate, db: AsyncSession = Depends(get_db)):
    try:
        service = AIService(db)
        response = await service.generate_chat_response(
            message=data.message,
            restaurant_name="Restaurant",
            context=""
        )
        
        return ChatMessageResponse(
            chat_log_id="chat-id",
            restaurant_id=data.restaurant_id,
            customer_id=data.customer_id,
            message=data.message,
            response=response,
            user_type=data.user_type,
            created_at="2024-01-01T00:00:00"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/recommendations", response_model=list[RecommendationResponse])
async def get_recommendations(data: RecommendationRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(MenuItem))
        menu_items = result.scalars().all()
        
        items_list = [{
            "name": item.name,
            "description": item.description,
            "price": float(item.price)
        } for item in menu_items]
        
        service = AIService(db)
        recommendations = await service.generate_recommendations(
            customer_preferences=data.preferences,
            budget=data.budget,
            menu_items=items_list
        )
        
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/menu/{restaurant_id}/special-offer")
async def get_special_offers(restaurant_id: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(MenuItem).limit(5))
        menu_items = result.scalars().all()
        
        items_list = [{"name": item.name, "price": float(item.price)} for item in menu_items]
        
        service = AIService(db)
        offer = await service.generate_special_offers("Restaurant", items_list)
        
        return {"special_offer": offer}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/menu/{restaurant_id}/analysis")
async def analyze_menu(restaurant_id: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(MenuItem))
        menu_items = result.scalars().all()
        
        items_list = [{
            "name": item.name,
            "price": float(item.price),
            "description": item.description
        } for item in menu_items]
        
        service = AIService(db)
        analysis = await service.analyze_menu("Restaurant", items_list)
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
