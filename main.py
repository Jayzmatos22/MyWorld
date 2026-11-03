from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from app.config import settings
from app.exceptions.handlers import register_exception_handlers
from app.routers.nasa import apod
from app.routers.llm import llm
from app.routers.likes import likes



app = FastAPI(title="My World")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    expose_headers=["Retry-After"],
)
app.include_router(apod.router)
app.include_router(llm.router)
app.include_router(likes.router)
register_exception_handlers(app)

handler = Mangum(app)
