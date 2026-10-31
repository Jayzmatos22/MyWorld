from pydantic import BaseModel, field_validator
from typing import Literal
from datetime import date
from bs4 import BeautifulSoup
import html
import re


def clean_text(v: str | None) -> str | None:
    """Limpa o texto (vem html imbutido)"""
    if v is None:
        return None

    text = BeautifulSoup(v, "html.parser").get_text()
    text = html.unescape(text)
    text = text.removeprefix("Explanation:")
    text = text.split("Tomorrow's picture")[0]
    text = re.sub(r"\s+", " ", text).strip()

    return text or None


''' Modelo de resposta da API da NASA para o APOD (Astronomy Picture of the Day) '''
class ApodResponse(BaseModel):
    date: date
    post_id: int
    title: str
    permalink: str
    media_type: Literal["image", "video"]
    explanation: str
    credit: str | None = None
    copyright: str | None = None
    alt: str | None = None
    url: str
    hdurl: str = ""

    @field_validator("explanation", "credit", "copyright", "alt", mode="before")
    @classmethod
    def clean_text(cls, v: str | None) -> str | None:
        return clean_text(v)


''' Modelo de resposta da api.nasa.gov/planetary/apod (usado pelo front) '''
class ApodItem(BaseModel):
    date: date
    title: str
    explanation: str
    media_type: Literal["image", "video", "other"]
    url: str | None = None
    hdurl: str | None = None
    thumbnail_url: str | None = None
    copyright: str | None = None

    @field_validator("explanation", "copyright", "title", mode="before")
    @classmethod
    def clean_text(cls, v: str | None) -> str | None:
        return clean_text(v)


''' Exemplo de modelo-resposta da api'''
'''
{"
date": "2026-09-11",
"post_id": 1308668
,"title": "M83: The Southern Pinwheel",
"permalink": "https://science.nasa.gov/image-article/apod-2026-september-11-m83-the-southern-pinwheel/","media_type":
"image",
"explanation": "Explicação detalhada",
"credit": "Aldo Zanetti",
"copyright": "Aldo Zanetti",
"alt": "Uma galáxia espiral é mostrada na frente de um campo escuro de estrelas.",
"url": "https://science.nasa.gov/image-article/apod-2026-september-11-m83-the-southern-pinwheel/","hdurl":
"https://assets.science.nasa.gov/dynamicimage/assets/science/cds/apod/apod/2026/setember/M83_Final2_1x.jpg?w=3828&h=3798&fit=clip&crop=faces%2Cfocalpoint",
"basic_html": "HTML da página",
"url_html_básica": "https://science.nasa.gov/wp-json/wp/v2/apod-basic/260911/html"} '''
