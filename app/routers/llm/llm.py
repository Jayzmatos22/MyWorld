from fastapi import APIRouter, Query
from app.models.llm import ChatResponse, ChatRequest
from app.config.llm import PROVIDERS





router = APIRouter(prefix="/llm", tags=["LLM"])

DEFAULT_PROVIDER="nvidia"


@router.get("/providers")
def list_providers():
    return [
        {"id": pid, "name": p.name, "models": p.models, "default_model": p.standard_model}
        for pid, p in PROVIDERS.items()
    ]
