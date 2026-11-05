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

''' Modelos de chat liberados no select (plano gratuito), testados com mensagem de sistema.
Fora da lista: Groq whisper/orpheus (áudio), prompt-guard/safeguard (classificadores);
Google gemini-2.5-* (desativado p/ contas novas), gemini-3.8-flash (timeout),
gemma-4-* (erro 500 com mensagem de sistema), gemini-3.1-flash-lite (503 por demanda) '''
NVIDIA_MODELS = ["openai/gpt-oss-20b", "nvidia/nemotron-3.5-super-vl-120b-a12b", "nvidia/nemotron-3-ultra-550b-a55b"]
GROQ_MODELS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b", "qwen/qwen3.8-27b"]
GOOGLE_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3-flash-preview", "gemini-3.6-flash"]


def _with_default(default: str, models: list[str]) -> list[str]:
    ''' Modelo padrão (do .env) sempre liberado e primeiro no select '''
    return [default, *(m for m in models if m != default)]


PROVIDERS = {
    ID_NVIDIA: Provider(
        name=NVIDIA_NAME_PROVIDER,
        base_url=NVIDIA_URL,
        env_key="NVIDIA_API_KEY",
        standard_model=settings.standard_nvidia_model,
        models=_with_default(settings.standard_nvidia_model, NVIDIA_MODELS),
    ),
    ID_GROQ: Provider(
        name=GROQ_NAME_PROVIDER,
        base_url=GROQ_URL,
        env_key="GROQ_API_KEY",
        standard_model=settings.groq_standard_model,
        models=_with_default(settings.groq_standard_model, GROQ_MODELS),
    ),
    ID_GOOGLE: Provider(
        name=GOOGLE_AI_NAME_PROVIDER,
        base_url=GOOGLE_AI_URL,
        env_key="GOOGLE_API_KEY",
        standard_model=settings.google_standard_model,
        models=_with_default(settings.google_standard_model, GOOGLE_MODELS),
    ),
}
