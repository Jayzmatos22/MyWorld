from fastapi import APIRouter, Query
from datetime import date
from app.models.apod import ApodResponse, ApodItem
from app.exceptions import ContractApiError
from app.services.nasa_client import (
    get_general_apod_response,
    get_today_apod,
    get_apod_by_date,
    get_apod_range,
    get_random_apods,
)


APOD_FIRST_DAY = date(1995, 6, 16)
MAX_RANGE_DAYS = 31

router = APIRouter(prefix="/apod", tags=["APOD"])

@router.get("", response_model=list[ApodResponse])
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


@router.get("/range", response_model=list[ApodItem])
def apod_range(start: date, end: date):
    if start > end:
        raise ContractApiError("A data inicial deve ser anterior à final.")
    if start < APOD_FIRST_DAY:
        raise ContractApiError("O primeiro APOD é de 16/06/1995.")
    if (end - start).days + 1 > MAX_RANGE_DAYS:
        raise ContractApiError(f"O intervalo máximo é de {MAX_RANGE_DAYS} dias.")
    return get_apod_range(start, end)


@router.get("/random", response_model=list[ApodItem])
def random_apods(count: int = Query(8, ge=1, le=20)):
    return get_random_apods(count)
