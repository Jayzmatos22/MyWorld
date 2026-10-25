from pydantic_settings import BaseSettings


NASA_BASE_URL = "https://science.nasa.gov/wp-json/wp/v2"
APOD_URL = f"{NASA_BASE_URL}/apod-basic/"

''' API oficial (api.nasa.gov): suporta data, intervalo e aleatórios '''
NASA_PLANETARY_URL = "https://api.nasa.gov/planetary/apod"

class Settings(BaseSettings):
    nasa_api_key: str = "DEMO_KEY"
    cors_origins: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"

settings = Settings()
