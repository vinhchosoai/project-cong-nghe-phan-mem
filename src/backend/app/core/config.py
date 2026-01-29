from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    database_url: str
    redis_url: str
    qdrant_url: str
    qdrant_api_key: str = ""
    google_gemini_api_key: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    environment: str = "development"
    debug: bool = True
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:8081"]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
