from fastapi import APIRouter

from app.models.llm.llm_models import ChatRequest, ChatResponse, ProviderOption
from app.services.llm.llm_integration import ask, get_providers


router = APIRouter(prefix="/llm", tags=["LLM"])

'''Listar todos os provedores/IA'''
@router.get("/providers", response_model=list[ProviderOption])
def providers():
    return get_providers()


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    return ask(req)