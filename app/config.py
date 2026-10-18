from pydantic_settings import BaseSettings


NASA_BASE_URL = "https://science.nasa.gov/wp-json/wp/v2"
APOD_URL = f"{NASA_BASE_URL}/apod-basic/"

class Settings(BaseSettings):
    nasa_api_key: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()