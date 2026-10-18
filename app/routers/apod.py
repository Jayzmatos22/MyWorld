from fastapi import APIRouter, Query
from app.models.apod import ApodResponse
from app.services.nasa_client import get_general_apod_response



router = APIRouter(prefix="/apod", tags=["APOD"])

@router.get("", response_model=list[ApodResponse])
def general_apod(page: int = Query(1, ge=1), per_page: int = Query(10, ge=1, le=50)):
    return get_general_apod_response(page, per_page)




