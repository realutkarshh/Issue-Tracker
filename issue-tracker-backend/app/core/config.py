from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "issue_tracker"
    
    class Config:
        env_file = ".env"

settings = Settings()
