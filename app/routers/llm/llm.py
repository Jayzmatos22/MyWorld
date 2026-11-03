from fastapi import APIRouter, Depends

from app.config.rate_limit import CHAT_RULES
from app.models.llm.llm_models import ChatRequest, ChatResponse, ProviderOption
from app.services.llm.llm_integration import ask, get_providers
from app.services.rate_limit.rate_limit import rate_limit


router = APIRouter(prefix="/llm", tags=["LLM"])

'''Listar todos os provedores/IA'''
@router.get("/providers", response_model=list[ProviderOption])
def providers():
    return get_providers()


# Cada pergunta gasta as chaves de IA: limite por IP (anonimizado)
@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(rate_limit(*CHAT_RULES))])
def chat(req: ChatRequest):
    return ask(req)