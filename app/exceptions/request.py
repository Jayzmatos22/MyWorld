''' Pedido inválido vindo do front '''
from app.exceptions.base import AppError


class ContractApiError(AppError):
    status_code = 400
    code = "bad_request"
    message = "Pedido inválido."
