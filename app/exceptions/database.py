''' Falhas do DynamoDB '''
from app.exceptions.base import AppError


class DatabaseUnavailableError(AppError):
    status_code = 503
    code = "unavailable"
    message = "O banco de dados não respondeu. Tente de novo em instantes."
