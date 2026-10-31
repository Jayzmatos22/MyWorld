''' Pedido inválido vindo do front '''

class ContractApiError(Exception):
    status_code = 400
