from pydantic_settings import BaseSettings
WAREHOUSE_LATITUDE: float = 12.9716
WAREHOUSE_LONGITUDE: float = 77.5946


class Settings(BaseSettings):
    DATABASE_URL: str
    APP_NAME: str = "NexRoute"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION"

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    class Config:
        env_file = ".env"


settings = Settings()