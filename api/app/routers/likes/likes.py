from datetime import date

from fastapi import APIRouter, Depends, Query

from app.config.rate_limit import LIKE_RULES
from app.models.likes.likes import LikeCount, RankedPlate
from app.services.likes import add_like, get_likes, top_likes
from app.services.rate_limit.rate_limit import rate_limit


router = APIRouter(prefix="/likes", tags=["Likes"])


'''Ranking da página de favoritos (antes de /{day} para "top" não virar data)'''
@router.get("/top", response_model=list[RankedPlate])
def ranking(limit: int = Query(30, ge=1, le=50)):
    return top_likes(limit)


@router.get("/{day}", response_model=LikeCount)
def like_count(day: date):
    return get_likes(day)


'''Curtida repetível: o mesmo cliente pode curtir de novo, limitado pelo rate limit'''
@router.post("/{day}", response_model=LikeCount, dependencies=[Depends(rate_limit(*LIKE_RULES))])
def like(day: date):
    return add_like(day)
