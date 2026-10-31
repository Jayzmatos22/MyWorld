''' Modelos de ia'''
from pydantic import BaseModel, field_validator, Field


''' 3 paramêtros. provider define a IA escolhida'''
class chatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000, description="A pergunta deve ter de 1 a 2000 caracteres")
    provider: str | None = None
    model: str | None = None

class ChatResponse(BaseModel):
    provider: str
    model: str
    response: str
