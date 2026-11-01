import os
import time
from dataclasses import dataclass

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from openai import APIStatusError, OpenAI
from app.config.llm import PROVIDERS
from functools import lru_cache
from app.exceptions.llm import ContractLLMError

from app.models.llm.llm_models import ChatRequest, ChatResponse, ProviderOption
from app.config import settings







'''Obter client padrão'''
@lru_cache
def get_client(pid: str) -> OpenAI:
    provider = PROVIDERS[pid]
    key = getattr(settings, provider.env_key.lower())   # "GROQ_API_KEY" → settings.groq_api_key
    if key is None:
        raise ContractLLMError(f"Chave {provider.env_key} não configurada.")
    return OpenAI(base_url=provider.base_url, api_key=key.get_secret_value())


# opções
def get_providers() -> list[ProviderOption]:
    return [
        ProviderOption(id=pid, name=p.name, models=p.models, default_model=p.standard_model)
        for pid, p in PROVIDERS.items()
    ]


def ask(req: ChatRequest) -> ChatResponse:
    provider = PROVIDERS[req.provider]
    model = req.model or provider.standard_model

    if model not in provider.models:
        raise ContractLLMError(f"Modelo {model} não disponível em {provider.name}")

    completion = get_client(req.provider).chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": req.question}],
    )
    return ChatResponse(
        provider=req.provider, 
        model=model, 
        response=completion.choices[0].message.content or ""
    )
