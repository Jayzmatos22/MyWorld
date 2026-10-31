''' Provedores de IA (todos expõem API compatível com a da OpenAI) '''
from pydantic import BaseModel

from app.config.settings import settings


NVIDIA_URL = "https://integrate.api.nvidia.com/v1"


'''Modelo - provedores atuais'''
class Provider(BaseModel):
    name: str
    base_url: str
    env_key: str
    standard_model: str


PROVIDERS = {
    "nvidia": Provider(
        name="NVIDIA Build",
        base_url=NVIDIA_URL,
        env_key="NVIDIA_API_KEY",
        standard_model=settings.standard_nvidia_model,
    ),
    "groq": Provider(
        name="Groq",
        base_url="https://api.groq.com/openai/v1",
        env_key="GROQ_API_KEY",
        standard_model=settings.groq_standard_model,
    ),
    "google": Provider(
        name="Google AI Studio",
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        env_key="GEMINI_API_KEY",
        standard_model=settings.gemini_standard_model,
    ),
}
