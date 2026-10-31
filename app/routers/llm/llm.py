from fastapi import APIRouter, Query
from app.models.llm import ChatResponse, ChatRequest
from app.config.llm import PROVIDERS
from app.services.llm import ask, get_providers
from app.models.llm import ProviderOption




router = APIRouter(prefix="/llm", tags=["LLM"])

'''Listar todos os provedores/IA'''
@router.get("/providers", response_model=list[ProviderOption])
def providers():
    return get_providers()


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    return ask(req)