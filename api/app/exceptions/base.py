''' Base de todas as exceções da API: cada uma já sabe o status, o code e a mensagem
que o front recebe em {"message", "code"} '''


class AppError(Exception):
    status_code = 500
    code = "unavailable"          # um dos códigos que o front conhece (web/src/api/types.ts)
    message = "Erro inesperado no servidor."

    def __init__(self, message: str | None = None, *, headers: dict[str, str] | None = None):
        super().__init__(message or self.message)
        self.headers = headers


def retry_after_header(seconds: int | None) -> dict[str, str] | None:
    return {"Retry-After": str(seconds)} if seconds else None
