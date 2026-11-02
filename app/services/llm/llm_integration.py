from functools import lru_cache

from openai import OpenAI

from app.config import settings
from app.config.llm import PROVIDERS
from app.exceptions.llm import ContractLLMError
from app.models.llm.llm_models import ChatRequest, ChatResponse, ProviderOption
from app.services.llm.prompts import build_messages
from app.services.nasa import get_apod_by_date

MAX_TOKENS = 2000


'''Obter client padrão'''
@lru_cache
def get_client(pid: str) -> OpenAI:
    provider = PROVIDERS[pid]
    key = getattr(settings, provider.env_key.lower())   # "GROQ_API_KEY" → settings.groq_api_key
    if key is None:
        raise ContractLLMError(f"Chave {provider.env_key} não configurada.")
    # Sem timeout a lib espera ~10 min e ainda repete 2x; o Lambda corta em 29s
    return OpenAI(base_url=provider.base_url, api_key=key.get_secret_value(), timeout=25, max_retries=1)


# opções
def get_providers() -> list[ProviderOption]:
    return [
        ProviderOption(id=pid, name=p.name, models=p.models, default_model=p.standard_model)
        for pid, p in PROVIDERS.items()
    ]


# by_data já possui cache.
# por data não confundi a api, pois alguém poderia editar o contexto
def ask(req: ChatRequest) -> ChatResponse:
    provider = PROVIDERS[req.provider]
    model = req.model or provider.standard_model

    if model not in provider.models:
        raise ContractLLMError(f"Modelo {model} não disponível em {provider.name}")

    apod = get_apod_by_date(req.date)

    completion = get_client(req.provider).chat.completions.create(
        model=model,
        messages=build_messages(apod, req.question),
        temperature=0.2,                       # menos criatividade = mais preso ao contexto
        # modelos de raciocínio (gpt-oss, nemotron) gastam tokens "pensando" antes de responder;
        # com 600 a resposta saía cortada no meio da frase
        max_tokens=MAX_TOKENS,
    )
    choice = completion.choices[0]
    response = choice.message.content or ""
    if choice.finish_reason == "length":       # bateu no limite: avisa em vez de parar no meio
        response = f"{response.rstrip()}… (resposta interrompida pelo limite de tamanho)"

    return ChatResponse(provider=req.provider, model=model, response=response)
