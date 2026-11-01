''' Provedores de IA (todos expõem API compatível com a da OpenAI) '''
from app.config.settings import settings
from app.models.llm.llm_models import Provider

NVIDIA_URL = "https://integrate.api.nvidia.com/v1"
GROQ_URL = "https://api.groq.com/openai/v1"
GOOGLE_AI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

NVIDIA_NAME_PROVIDER = "NVIDIA Build"
GROQ_NAME_PROVIDER = "Groq"
GOOGLE_AI_NAME_PROVIDER = "Google AI Studio"

ID_NVIDIA = "nvidia"
ID_GROQ = "groq"
ID_GOOGLE = "google"


PROVIDERS = {
    ID_NVIDIA: Provider(
        name=NVIDIA_NAME_PROVIDER,
        base_url=NVIDIA_URL,
        env_key="NVIDIA_API_KEY",
        standard_model=settings.standard_nvidia_model,
        models=[settings.standard_nvidia_model],
    ),
    ID_GROQ: Provider(
        name=GROQ_NAME_PROVIDER,
        base_url=GROQ_URL,
        env_key="GROQ_API_KEY",
        standard_model=settings.groq_standard_model,
        models=[settings.groq_standard_model],
    ),
    ID_GOOGLE: Provider(
        name=GOOGLE_AI_NAME_PROVIDER,
        base_url=GOOGLE_AI_URL,
        env_key="GEMINI_API_KEY",
        standard_model=settings.gemini_standard_model,
        models=[settings.gemini_standard_model],
    ),
}
