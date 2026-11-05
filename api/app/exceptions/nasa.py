''' Falhas vindas da NASA '''
from app.exceptions.base import AppError, retry_after_header


class ApiServerError(AppError):
    status_code = 503
    code = "unavailable"
    message = "Erro ao acessar a API da NASA."


class ApodNotFoundError(AppError):
    status_code = 404
    code = "not_found"
    message = "Nenhum APOD para esta data."


class RateLimitError(AppError):
    ''' Limite de requisições da api.nasa.gov (429) '''
    status_code = 429
    code = "rate_limited"
    message = "Limite de requisições da NASA atingido."

    def __init__(self, retry_after: int | None = None):
        super().__init__(headers=retry_after_header(retry_after))
        self.retry_after = retry_after
