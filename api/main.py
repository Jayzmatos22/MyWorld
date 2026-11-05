from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum
from app.config import settings
from app.exceptions.handlers import register_exception_handlers
from app.routers.nasa import apod
from app.routers.llm import llm
from app.routers.likes import likes


# Maior corpo legítimo: a pergunta do chat (2000 caracteres) mais o JSON em volta.
# A Function URL aceita até 6 MB; sem este teto o FastAPI faria o parse de qualquer coisa.
MAX_BODY_BYTES = 16 * 1024


# Em produção o template define ENABLE_DOCS=false: o schema da API não fica exposto
docs = settings.enable_docs
app = FastAPI(
    title="My World",
    docs_url="/docs" if docs else None,
    redoc_url="/redoc" if docs else None,
    openapi_url="/openapi.json" if docs else None,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    expose_headers=["Retry-After"],
)


@app.middleware("http")
async def guard_request(request: Request, call_next):
    length = request.headers.get("content-length", "")
    if length.isdigit() and int(length) > MAX_BODY_BYTES:
        return JSONResponse(status_code=413, content={"message": "Pedido grande demais.", "code": "bad_request"})
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


app.include_router(apod.router)
app.include_router(llm.router)
app.include_router(likes.router)
register_exception_handlers(app)

handler = Mangum(app)
