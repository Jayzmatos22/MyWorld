class ApiServerError(Exception):
    status_code = 503

class ContractApiError(Exception):
    status_code = 400