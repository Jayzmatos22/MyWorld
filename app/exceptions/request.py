''' Pedido inválido ou excessivo vindo do front '''
from app.exceptions.base import AppError, retry_after_header


class ContractApiError(AppError):
    status_code = 400
    code = "bad_request"
    message = "Pedido inválido."


class TooManyRequestsError(AppError):
    ''' Rate limit da própria API (por IP anonimizado) '''
    status_code = 429
    code = "rate_limited"
    message = "Muitas requisições seguidas. Espere um pouco."

    def __init__(self, message: str | None = None, retry_after: int | None = None):
        super().__init__(message, headers=retry_after_header(retry_after))
        self.retry_after = retry_after
