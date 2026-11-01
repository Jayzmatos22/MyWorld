''' Modelos de ia'''
from pydantic import BaseModel, field_validator, Field
from typing import Literal



''' Modelo - provedores atuais.
Não importar app.config aqui: o config/llm.py já importa este arquivo (importação circular) '''
class Provider(BaseModel):
    name: str
    base_url: str
    env_key: str
    standard_model: str
    models: list[str]  # nomes de modelo liberados para o select (ex.: "openai/gpt-oss-20b")


class ProviderOption(BaseModel):
    ''' O que o front recebe para montar os selects '''
    id: str
    name: str
    models: list[str]
    default_model: str




''' 3 paramêtros. provider define a IA escolhida'''
class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000, description="A pergunta deve ter de 1 a 2000 caracteres")
    provider: Literal["nvidia", "groq", "google"]
    model: str | None = None

class ChatResponse(BaseModel):
    provider: str
    model: str
    response: str
