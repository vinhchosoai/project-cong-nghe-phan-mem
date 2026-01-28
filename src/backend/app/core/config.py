from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "S2O Smart Restaurant Platform"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:5173"
    ]
    
    # AI
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_AI_API_KEY: Optional[str] = None
    QDRANT_URL: str = "http://localhost:6333"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    model_config = SettingsConfigDict(
        env_file=".env", 
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()