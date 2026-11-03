import logging
import math
from functools import lru_cache

import openai
from openai import OpenAI
from openai.types.chat import ChatCompletion

from app.config import settings
from app.config.llm import PROVIDERS
from app.exceptions.llm import ContractLLMError, LLMRateLimitError, LLMUnavailableError
from app.models.llm.llm_models import ChatRequest, ChatResponse, Provider, ProviderOption
from app.services.llm.prompts import build_messages
from app.services.nasa import get_apod_by_date


logger = logging.getLogger("uvicorn.error")

MAX_TOKENS = 2000


'''Obter client padrão'''
@lru_cache
def get_client(pid: str) -> OpenAI:
    provider = PROVIDERS[pid]
    key = getattr(settings, provider.env_key.lower())   # "GROQ_API_KEY" → settings.groq_api_key
    if key is None:
        # Falta de configuração do servidor, não erro do usuário: 503, e o nome da variável fica só no log
        logger.error("LLM %s sem chave: defina %s", pid, provider.env_key)
        raise LLMUnavailableError(f"{provider.name} não está configurado no servidor. Escolha outro provedor.")
    # Sem timeout a lib espera ~10 min e ainda repete 2x; o Lambda corta em 29s
    return OpenAI(base_url=provider.base_url, api_key=key.get_secret_value(), timeout=25, max_retries=1)


# opções
def get_providers() -> list[ProviderOption]:
    return [
        ProviderOption(id=pid, name=p.name, models=p.models, default_model=p.standard_model)
        for pid, p in PROVIDERS.items()
    ]


def retry_after(exc: openai.APIStatusError) -> int | None:
    value = exc.response.headers.get("retry-after")
    try:
        return max(1, math.ceil(float(value))) if value else None
    except ValueError:
        return None


def status_error(provider: Provider, model: str, exc: openai.APIStatusError) -> LLMUnavailableError:
    ''' Traduz o HTTP do provedor; o corpo original (pode citar a conta) fica só no log '''
    logger.warning("LLM %s/%s respondeu HTTP %s: %s", provider.name, model, exc.status_code, exc.message)
    if exc.status_code in (404, 410):          # modelo desativado ou fora do catálogo da conta
        return LLMUnavailableError(f"O modelo {model} não está mais disponível no {provider.name}. Escolha outro.")
    if exc.status_code in (401, 403):
        return LLMUnavailableError(f"O {provider.name} recusou a credencial do servidor. Escolha outro provedor.")
    return LLMUnavailableError(f"O {provider.name} falhou ao responder (HTTP {exc.status_code}). Tente outro modelo.")


def complete(pid: str, model: str, messages: list[dict]) -> ChatCompletion:
    ''' Chama o provedor e converte os erros do SDK nas exceções da API '''
    provider = PROVIDERS[pid]
    try:
        return get_client(pid).chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.2,                       # menos criatividade = mais preso ao contexto
            # modelos de raciocínio (gpt-oss, nemotron) gastam tokens "pensando" antes de responder;
            # com 600 a resposta saía cortada no meio da frase
            max_tokens=MAX_TOKENS,
        )
    except openai.RateLimitError as e:
        raise LLMRateLimitError(
            f"Limite de perguntas do {provider.name} atingido. Espere um pouco ou troque de provedor.",
            retry_after(e),
        ) from e
    except openai.APITimeoutError as e:        # antes de APIConnectionError: é subclasse dela
        logger.warning("LLM %s/%s estourou o timeout", provider.name, model)
        raise LLMUnavailableError(f"O {provider.name} demorou demais para responder. Tente outro modelo.") from e
    except openai.APIConnectionError as e:
        logger.warning("LLM %s/%s sem conexão: %s", provider.name, model, e)
        raise LLMUnavailableError(f"Não foi possível conectar ao {provider.name}.") from e
    except openai.APIStatusError as e:
        raise status_error(provider, model, e) from e


# by_data já possui cache.
# por data não confundi a api, pois alguém poderia editar o contexto
def ask(req: ChatRequest) -> ChatResponse:
    provider = PROVIDERS[req.provider]
    model = req.model or provider.standard_model

    if model not in provider.models:
        raise ContractLLMError(f"Modelo {model} não disponível em {provider.name}.")

    apod = get_apod_by_date(req.date)
    completion = complete(req.provider, model, build_messages(apod, req.question))

    choice = completion.choices[0] if completion.choices else None
    response = (choice.message.content or "").strip() if choice else ""
    if not response:                           # filtro de conteúdo, ou o modelo gastou tudo raciocinando
        raise LLMUnavailableError(f"O modelo {model} não devolveu texto. Tente outro modelo.")
    if choice.finish_reason == "length":       # bateu no limite: avisa em vez de parar no meio
        response = f"{response}… (resposta interrompida pelo limite de tamanho)"

    return ChatResponse(provider=req.provider, model=model, response=response)
