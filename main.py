from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.config import settings
from app.exceptions.handlers import register_exception_handlers
from app.routers import apod


app = FastAPI(title="My Planet")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET"],
    expose_headers=["Retry-After"],
)
app.include_router(apod.router)
register_exception_handlers(app)

handler = Mangum(app)
