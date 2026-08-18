from pydantic_settings import BaseSettings


# ==========================================================
# WAREHOUSE LOCATION
# ==========================================================

WAREHOUSE_LATITUDE: float = 12.9716
WAREHOUSE_LONGITUDE: float = 77.5946


# ==========================================================
# APPLICATION SETTINGS
# ==========================================================

class Settings(BaseSettings):

    # ------------------------------------------------------
    # DATABASE
    # ------------------------------------------------------

    DATABASE_URL: str

    # ------------------------------------------------------
    # APPLICATION
    # ------------------------------------------------------

    APP_NAME: str = "NexRoute"

    APP_ENV: str = "development"

    DEBUG: bool = True

    # ------------------------------------------------------
    # SECURITY
    # ------------------------------------------------------

    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION"

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    # ------------------------------------------------------
    # TOMTOM API
    # ------------------------------------------------------

    TOMTOM_API_KEY: str = "WPZ5JTwibY9hpkr74JK9wfJuAkS3QhrE"

    # ------------------------------------------------------
    # ENVIRONMENT FILE
    # ------------------------------------------------------

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# ==========================================================
# SETTINGS INSTANCE
# ==========================================================

settings = Settings()