''' Modelos de ia'''
from pydantic import BaseModel, field_validator, Field
import os




''' Serve para resposta de todas as IAs'''
class chatRequest(BaseModel):
    model_choice: str 

'''Modelo - provedores atuais'''
class Provider(BaseModel):
    name: str
    base_url: str
    env_key: str
    standard_model: str

PROVIDERS = {
    "nvidia": Provider(
        "NVIDIA Build",
        "https://integrate.api.nvidia.com/v1",
        "NVIDIA_API_KEY",
        os.getenv("STANDARD_NVIDIA_MODEL", "openai/gpt-oss-20b"),
    ),
    "groq": Provider(
        "Groq",
        "https://api.groq.com/openai/v1",
        "GROQ_API_KEY",
        os.getenv("GROQ_STANDARD_MODEL", "openai/gpt-oss-20b"),
    ),
    "google": Provider(
        "Google AI Studio",
        "https://generativelanguage.googleapis.com/v1beta/openai/",
        "GEMINI_API_KEY",
        os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
    ),
}


class ChatResponse(BaseModel):
    model: str
    response: str



