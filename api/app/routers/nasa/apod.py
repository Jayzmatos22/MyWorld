from fastapi import APIRouter, Depends, Query
from datetime import date
from app.models.nasa.apod import ApodResponse, ApodItem
from app.config.rate_limit import APOD_LIST_RULES, APOD_RANDOM_RULES
from app.exceptions import ContractApiError
from app.services.nasa import (
    get_general_apod_response,
    get_today_apod,
    get_apod_by_date,
    get_apod_range,
    get_random_apods,
)
from app.services.rate_limit.rate_limit import rate_limit


APOD_FIRST_DAY = date(1995, 6, 16)
MAX_RANGE_DAYS = 31

router = APIRouter(prefix="/apod", tags=["APOD"])

# Rotas que multiplicam chamadas à NASA têm rate limit; data e hoje usam cache e o limite global de custo
@router.get("", response_model=list[ApodResponse], dependencies=[Depends(rate_limit(*APOD_LIST_RULES))])
def general_apod(page: int = Query(1, ge=1), per_page: int = Query(10, ge=1, le=50)):
    return get_general_apod_response(page, per_page)


@router.get("/today", response_model=ApodItem)
def today_apod():
    return get_today_apod()


@router.get("/date/{day}", response_model=ApodItem)
def apod_by_date(day: date):
    if day < APOD_FIRST_DAY:
        raise ContractApiError("O primeiro APOD é de 16/06/1995.")
    return get_apod_by_date(day)


@router.get("/range", response_model=list[ApodItem], dependencies=[Depends(rate_limit(*APOD_LIST_RULES))])
def apod_range(start: date, end: date):
    if start > end:
        raise ContractApiError("A data inicial deve ser anterior à final.")
    if start < APOD_FIRST_DAY:
        raise ContractApiError("O primeiro APOD é de 16/06/1995.")
    if (end - start).days + 1 > MAX_RANGE_DAYS:
        raise ContractApiError(f"O intervalo máximo é de {MAX_RANGE_DAYS} dias.")
    return get_apod_range(start, end)


@router.get("/random", response_model=list[ApodItem], dependencies=[Depends(rate_limit(*APOD_RANDOM_RULES))])
def random_apods(count: int = Query(8, ge=1, le=20)):
    return get_random_apods(count)
