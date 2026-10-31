''' Falhas vindas da NASA '''

class ApiServerError(Exception):
    status_code = 503

class ApodNotFoundError(Exception):
    status_code = 404

class RateLimitError(Exception):
    ''' Limite de requisições da api.nasa.gov (429) '''
    status_code = 429

    def __init__(self, retry_after: int | None = None):
        super().__init__("Limite de requisições da NASA atingido")
        self.retry_after = retry_after
