from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr



''' Variáveis lidas do ambiente (ou do .env).
extra="ignore": o .env também guarda chaves que não passam por aqui (ex.: NVIDIA_API_KEY) '''
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    nasa_api_key: str = "DEMO_KEY"
    nvidia_api_key: SecretStr | None = None
    groq_api_key: SecretStr | None = None
    google_api_key: SecretStr | None = None
    
    cors_origins: list[str] = ["http://localhost:5173"]

    default_provider: str = "nvidia"
    standard_nvidia_model: str = "openai/gpt-oss-20b"
    groq_standard_model: str = "openai/gpt-oss-20b"
    # gemini-2.5-flash foi desativado pelo Google para contas novas (404)
    google_standard_model: str = "gemini-3.5-flash"

    # DynamoDB: no Lambda o template injeta TABLE_NAME e a AWS define AWS_REGION
    table_name: str = "myworld-local"
    aws_region: str = "us-east-1"
    dynamodb_endpoint: str | None = None       # ex.: http://localhost:8000 para o DynamoDB Local
    # Chave do HMAC que anonimiza o IP no rate limit (o IP em si nunca é gravado)
    rate_limit_secret: SecretStr | None = None


settings = Settings()
