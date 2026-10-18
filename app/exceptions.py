class ApiServerError(Exception):
    status_code = 500

class ContractApiError(Exception):
    status_code = 400