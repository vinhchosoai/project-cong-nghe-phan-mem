import uuid
from sqlalchemy import Column, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base_class import Base, TimestampMixin

class ChatLog(Base, TimestampMixin):
    __tablename__ = "chat_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    user_query = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    meta_data = Column(JSONB, nullable=True)