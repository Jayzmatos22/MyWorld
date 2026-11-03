from datetime import date
from typing import Literal

from pydantic import BaseModel


class LikeCount(BaseModel):
    date: date
    likes: int


''' Item do ranking: guarda título e prévia para a página não depender da NASA '''
class RankedPlate(BaseModel):
    date: date
    title: str
    media_type: Literal["image", "video", "other"]
    thumb: str | None = None
    likes: int
