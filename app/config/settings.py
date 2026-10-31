from pydantic_settings import BaseSettings, SettingsConfigDict


''' Variáveis lidas do ambiente (ou do .env).
extra="ignore": o .env também guarda chaves que não passam por aqui (ex.: NVIDIA_API_KEY) '''
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    nasa_api_key: str = "DEMO_KEY"
    cors_origins: list[str] = ["http://localhost:5173"]

    default_provider: str = "nvidia"
    standard_nvidia_model: str = "openai/gpt-oss-20b"
    groq_standard_model: str = "openai/gpt-oss-20b"
    gemini_standard_model: str = "gemini-2.5-flash"


settings = Settings()
