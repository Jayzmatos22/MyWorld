''' Provedores de IA (todos expõem API compatível com a da OpenAI) '''
from pydantic import BaseModel

from app.config.settings import settings


NVIDIA_URL = "https://integrate.api.nvidia.com/v1"
GROQ_URL = "https://api.groq.com/openai/v1"
GOOGLE_AI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

NVIDIA_NAME_PROVIDER = "NVIDIA Build"
GROQ_NAME_PROVIDER = "Groq"
GOOGLE_AI_NAME_PROVIDER = "Google AI Studio"


'''Modelo - provedores atuais'''
class Provider(BaseModel):
    name: str
    base_url: str
    env_key: str
    standard_model: str


PROVIDERS = {
    "nvidia": Provider(
        name=NVIDIA_NAME_PROVIDER,
        base_url=NVIDIA_URL,
        env_key="NVIDIA_API_KEY",
        standard_model=settings.standard_nvidia_model,
    ),
    "groq": Provider(
        name=GROQ_NAME_PROVIDER,
        base_url=GROQ_URL,
        env_key="GROQ_API_KEY",
        standard_model=settings.groq_standard_model,
    ),
    "google": Provider(
        name=GOOGLE_AI_NAME_PROVIDER,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        env_key=GOOGLE_AI_URL,
        standard_model=settings.gemini_standard_model,
    ),
}
