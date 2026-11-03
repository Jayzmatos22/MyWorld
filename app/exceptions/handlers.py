''' Converte as exceções no corpo de erro que o front espera: {"message", "code"} '''
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.exceptions.base import AppError


# Nomes dos campos como o usuário entende (body do chat e query/path do APOD)
FIELD_LABELS = {
    "question": "pergunta",
    "provider": "provedor",
    "model": "modelo",
    "date": "data",
    "day": "data",
    "start": "data inicial",
    "end": "data final",
    "count": "quantidade",
}

HTTP_MESSAGES = {404: "Rota não encontrada.", 405: "Método não permitido."}


def error_response(status_code: int, message: str, code: str, headers: dict[str, str] | None = None) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"message": message, "code": code}, headers=headers)


def app_error(request: Request, exc: AppError) -> JSONResponse:
    return error_response(exc.status_code, str(exc), exc.code, exc.headers)


def describe_validation(error: dict) -> str:
    field = str(error["loc"][-1]) if error.get("loc") else ""
    label = FIELD_LABELS.get(field, field)
    match error["type"]:
        case "missing":
            return f"Campo obrigatório ausente: {label}."
        case "string_too_short":
            return f"O campo {label} não pode ficar vazio."
        case "string_too_long":
            return f"O campo {label} passou do limite de {error['ctx']['max_length']} caracteres."
        case "json_invalid":
            return "Corpo da requisição não é um JSON válido."
        case _:
            return f"Valor inválido no campo {label}."


def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    ''' O FastAPI responderia 422 com {"detail": [...]}, que o front não entende '''
    errors = exc.errors()
    message = describe_validation(errors[0]) if errors else "Pedido inválido."
    return error_response(400, message, "bad_request")


def http_error(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    ''' Rota inexistente, método errado... '''
    code = "not_found" if exc.status_code == 404 else "unavailable" if exc.status_code >= 500 else "bad_request"
    message = HTTP_MESSAGES.get(exc.status_code, str(exc.detail))
    return error_response(exc.status_code, message, code, exc.headers)


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, app_error)
    app.add_exception_handler(RequestValidationError, validation_error)
    app.add_exception_handler(StarletteHTTPException, http_error)
