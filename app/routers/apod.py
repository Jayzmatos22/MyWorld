from fastapi import APIRouter
from app.models.apod import ApodResponse
from app.services.nasa_client import get_general_apod_response



router = APIRouter(prefix="/apod", tags=["APOD"])

@router.get("", response_model=list[ApodResponse])
def general_apod():
    return get_general_apod_response()




