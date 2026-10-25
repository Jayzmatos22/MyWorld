from fastapi import FastAPI
from app.routers import apod
from app.config import settings
from app.exceptions import ApiServerError, ApodNotFoundError, ContractApiError, RateLimitError
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum


app = FastAPI(title="My Planet")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET"],
    expose_headers=["Retry-After"],
)
app.include_router(apod.router)

'''' Exceptions'''
@app.exception_handler(ApiServerError)
def out_air_api_server_error(request: Request, exc: ApiServerError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": "Erro ao acessar a API da NASA.", "code": "unavailable"},
    )

@app.exception_handler(RateLimitError)
def rate_limit_error(request: Request, exc: RateLimitError):
    headers = {"Retry-After": str(exc.retry_after)} if exc.retry_after else None
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc), "code": "rate_limited"},
        headers=headers,
    )

@app.exception_handler(ApodNotFoundError)
def not_found_error(request: Request, exc: ApodNotFoundError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc), "code": "not_found"},
    )

@app.exception_handler(ContractApiError)
def contract_error(request: Request, exc: ContractApiError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc), "code": "bad_request"},
    )

handler = Mangum(app)
