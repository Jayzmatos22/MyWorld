''' Converte as exceções no corpo de erro que o front espera: {"message", "code"} '''
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.exceptions.nasa import ApiServerError, ApodNotFoundError, RateLimitError
from app.exceptions.llm import ContractLLMError
from app.exceptions.request import ContractApiError


def out_air_api_server_error(request: Request, exc: ApiServerError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": "Erro ao acessar a API da NASA.", "code": "unavailable"},
    )

def rate_limit_error(request: Request, exc: RateLimitError):
    headers = {"Retry-After": str(exc.retry_after)} if exc.retry_after else None
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc), "code": "rate_limited"},
        headers=headers,
    )

def not_found_error(request: Request, exc: ApodNotFoundError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc), "code": "not_found"},
    )

def contract_error(request: Request, exc: ContractApiError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc), "code": "bad_request"},
    )

def contract_llm_error(request: Request, exc: ContractLLMError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc), "code": "bad_request"},
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(ApiServerError, out_air_api_server_error)
    app.add_exception_handler(RateLimitError, rate_limit_error)
    app.add_exception_handler(ApodNotFoundError, not_found_error)
    app.add_exception_handler(ContractApiError, contract_error)
    app.add_exception_handler(ContractLLMError, contract_llm_error)
