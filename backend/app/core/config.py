import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/tower_locator")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")

    class Config:
        env_file = ".env"


settings = Settings()