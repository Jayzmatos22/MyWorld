''' Modelos de ia'''
from pydantic import BaseModel, field_validator, Field
from app.config.llm import ID_GOOGLE, ID_GROQ, ID_NVIDIA



providers: list[str] = [ID_GOOGLE, ID_GROQ, ID_NVIDIA]


'''Modelo - provedores atuais'''
class Provider(BaseModel):
    name: str
    base_url: str
    env_key: str
    standard_model: str
    models: list[str] = providers



''' 3 paramêtros. provider define a IA escolhida'''
class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000, description="A pergunta deve ter de 1 a 2000 caracteres")
    provider: str | None = None
    model: str | None = None

class ChatResponse(BaseModel):
    provider: str
    model: str
    response: str
