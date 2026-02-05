import google.generativeai as genai
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from typing import Optional, List
import json


class AIService:
    def __init__(self, db: AsyncSession):
        self.db = db
        genai.configure(api_key=settings.google_gemini_api_key)
        self.model = genai.GenerativeModel('gemini-pro')

    async def generate_chat_response(self, message: str, restaurant_name: str, context: str = "") -> str:
        try:
            prompt = f"""You are a helpful customer service assistant for {restaurant_name} restaurant.
Customer message: {message}
Additional context: {context}

Provide a helpful and friendly response in the same language as the customer's message."""
            
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"I apologize, but I encountered an error: {str(e)}"

    async def generate_recommendations(self, customer_preferences: Optional[str], 
                                       budget: Optional[float], menu_items: List[dict]) -> List[dict]:
        try:
            items_text = "\n".join([f"- {item['name']}: ${item['price']} ({item.get('description', '')})" 
                                   for item in menu_items])
            
            prompt = f"""Based on the following menu and customer preferences, recommend the best dishes:

Menu Items:
{items_text}

Customer Preferences: {customer_preferences or 'No specific preference'}
Budget: ${budget or 'No budget limit'}

Respond with a JSON array of recommended item names with a recommendation_score from 0-1. 
Format: [{{"name": "item_name", "recommendation_score": 0.95}}]"""
            
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            start_idx = response_text.find('[')
            end_idx = response_text.rfind(']') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                recommendations = json.loads(json_str)
                return recommendations
            return []
        except Exception as e:
            return []

    async def generate_special_offers(self, restaurant_name: str, menu_items: List[dict]) -> str:
        try:
            items_text = ", ".join([item['name'] for item in menu_items[:5]])
            
            prompt = f"""Create an engaging promotional message for {restaurant_name} restaurant featuring these dishes: {items_text}.
Keep it short and catchy."""
            
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Special promotion available at {restaurant_name}!"

    async def analyze_menu(self, restaurant_name: str, menu_items: List[dict]) -> dict:
        try:
            items_text = "\n".join([f"- {item['name']}: ${item['price']}" for item in menu_items])
            
            prompt = f"""Analyze this menu for {restaurant_name} and provide insights:

{items_text}

Provide analysis in JSON format with: avg_price, price_range, cuisine_analysis"""
            
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                analysis = json.loads(json_str)
                return analysis
            return {"error": "Could not parse analysis"}
        except Exception as e:
            return {"error": str(e)}
