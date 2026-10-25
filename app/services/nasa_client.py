from pydantic import TypeAdapter
from app.models.apod import ApodResponse, ApodItem
from app.config import APOD_URL, NASA_PLANETARY_URL, settings
from app.exceptions import ApiServerError, ApodNotFoundError, ContractApiError, RateLimitError
from pydantic import ValidationError
from datetime import date, timedelta
import requests
from cachetools import TTLCache, cached




apod_cache = TTLCache(maxsize=100, ttl=3600)  # Cache com tamanho máximo de 100 itens e tempo de vida de 1 hora
@cached(cache=apod_cache)
def get_general_apod_response(page: int, per_page: int) -> list[ApodResponse]:

    try:
        response = requests.get(
            APOD_URL,
            params={"page": page, "per_page": per_page},
            timeout=10,
        )

        response.raise_for_status()
        data = response.json()

    except requests.RequestException as e:
        raise ApiServerError("NASA indisponível") from e

    try:
        return TypeAdapter(list[ApodResponse]).validate_python(data)
    except ValidationError as e:
        raise ValueError("Erro ao validar a resposta da API da NASA.") from e


''' api.nasa.gov/planetary/apod '''

def _nasa_error_message(response: requests.Response) -> str:
    try:
        return str(response.json().get("msg", ""))
    except ValueError:
        return ""


def _planetary_request(params: dict[str, str | int]) -> object:
    try:
        response = requests.get(
            NASA_PLANETARY_URL,
            params={"api_key": settings.nasa_api_key, "thumbs": "true", **params},
            timeout=10,
        )
    except requests.RequestException as e:
        raise ApiServerError("NASA indisponível") from e

    if response.status_code == 429:
        retry_after = response.headers.get("Retry-After")
        raise RateLimitError(int(retry_after) if retry_after and retry_after.isdigit() else None)
    if response.status_code == 404:
        raise ApodNotFoundError(_nasa_error_message(response) or "Nenhum APOD para esta data.")
    if response.status_code == 400:
        raise ContractApiError(_nasa_error_message(response) or "Parâmetros inválidos.")
    if not response.ok:
        raise ApiServerError("NASA indisponível")

    try:
        return response.json()
    except ValueError as e:
        raise ApiServerError("Resposta inválida da NASA") from e


def _validate_one(data: object) -> ApodItem:
    try:
        return ApodItem.model_validate(data)
    except ValidationError as e:
        raise ValueError("Erro ao validar a resposta da API da NASA.") from e


def _validate_many(data: object) -> list[ApodItem]:
    try:
        return TypeAdapter(list[ApodItem]).validate_python(data)
    except ValidationError as e:
        raise ValueError("Erro ao validar a resposta da API da NASA.") from e


today_cache = TTLCache(maxsize=1, ttl=1800)  # 30 min: o APOD do dia pode ser publicado com atraso
@cached(cache=today_cache)
def get_today_apod() -> ApodItem:
    try:
        return _validate_one(_planetary_request({}))
    except ApodNotFoundError:
        # Fuso: perto da meia-noite a NASA ainda não publicou o de "hoje"
        return get_apod_by_date(date.today() - timedelta(days=1))


date_cache = TTLCache(maxsize=512, ttl=86400)  # Datas passadas não mudam
@cached(cache=date_cache)
def get_apod_by_date(day: date) -> ApodItem:
    return _validate_one(_planetary_request({"date": day.isoformat()}))


range_cache = TTLCache(maxsize=64, ttl=3600)
@cached(cache=range_cache)
def get_apod_range(start: date, end: date) -> list[ApodItem]:
    items = _validate_many(
        _planetary_request({"start_date": start.isoformat(), "end_date": end.isoformat()})
    )
    return sorted(items, key=lambda item: item.date, reverse=True)


def get_random_apods(count: int) -> list[ApodItem]:
    return _validate_many(_planetary_request({"count": count}))
