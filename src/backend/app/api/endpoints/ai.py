from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from app.db.session import get_db
from app.services.ai_service import AIService
from app.schemas.ai import ChatQuery, ChatResponse, RecommendationRequest

router = APIRouter()


@router.post(
    "/chat",
    response_model=ChatResponse,
    tags=["AI"]
)
async def ask_restaurant_question(
    query: ChatQuery,
    db: Session = Depends(get_db)
):
    """Ask restaurant-related questions using AI chatbot"""
    try:
        service = AIService(db)
        response = await service.answer_question(
            restaurant_id=query.restaurant_id,
            question=query.question,
            context_history=query.context_history
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post(
    "/recommendations",
    response_model=List[dict],
    tags=["AI"]
)
async def get_restaurant_recommendations(
    request: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """Get restaurant recommendations based on location and preferences"""
    try:
        service = AIService(db)
        recommendations = await service.get_restaurant_recommendations(
            latitude=request.latitude,
            longitude=request.longitude,
            preferences=request.preferences
        )
        return recommendations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
