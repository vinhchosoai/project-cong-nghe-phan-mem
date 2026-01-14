from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "S2O Restaurant API"
    API_V1_STR: str = "api"
    
    BATABASE_URL: str 

    class Config:
        env_file =".env"