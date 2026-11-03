''' Falhas do chat com os provedores de IA '''
from app.exceptions.base import AppError, retry_after_header


class ContractLLMError(AppError):
    ''' Pedido inválido: modelo fora da lista do provedor '''
    status_code = 400
    code = "bad_request"
    message = "Pedido inválido para o provedor de IA."


class LLMUnavailableError(AppError):
    ''' Provedor fora do ar, lento, sem chave ou com o modelo desativado '''
    status_code = 503
    code = "unavailable"
    message = "O provedor de IA não respondeu. Tente outro modelo ou provedor."


class LLMRateLimitError(AppError):
    status_code = 429
    code = "rate_limited"
    message = "Limite de perguntas do provedor de IA atingido."

    def __init__(self, message: str | None = None, retry_after: int | None = None):
        super().__init__(message, headers=retry_after_header(retry_after))
        self.retry_after = retry_after
