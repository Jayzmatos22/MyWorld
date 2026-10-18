from pydantic import BaseModel, field_validator
from typing import Literal
from datetime import date


''' Resposta'''
class ApodResponse(BaseModel):
    date: date
    post_id: int
    title: str
    permalink: str
    media_type: Literal["image", "video"]
    explanation: str
    credit: str | None = None
    copyright: str | None = None
    alt: str = ""
    url: str
    hdurl: str = ""

    
    



''' Exemplo de resposta da api'''
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