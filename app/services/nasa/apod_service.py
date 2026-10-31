''' science.nasa.gov/wp-json/wp/v2/apod-basic
A api.nasa.gov/planetary/apod quebrou com a migração do apod.nasa.gov para o science.nasa.gov:
devolve o logo da NASA e o título "NASA Science" para qualquer data. '''
from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta
import random

import requests
from cachetools import TTLCache, cached
from pydantic import TypeAdapter, ValidationError

from app.config.nasa import APOD_URL
from app.exceptions import ApiServerError, ApodNotFoundError
from app.models.nasa.apod import ApodItem, ApodResponse
from app.services.nasa.client import basic_request, fetch_between, fetch_position, int_header
from app.services.nasa.parser import valid_items


RANDOM_WORKERS = 8


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


today_cache = TTLCache(maxsize=1, ttl=1800)  # 30 min: o APOD do dia pode ser publicado com atraso
@cached(cache=today_cache)
def get_today_apod() -> ApodItem:
    today = date.today()
    try:
        return get_apod_by_date(today)
    except ApodNotFoundError:
        # Fuso: o servidor pode já estar no dia seguinte ao da NASA, ou o de hoje ainda não saiu
        return get_apod_by_date(today - timedelta(days=1))


date_cache = TTLCache(maxsize=512, ttl=86400)  # Datas passadas não mudam
@cached(cache=date_cache)
def get_apod_by_date(day: date) -> ApodItem:
    items = valid_items(fetch_between(day, day))
    if not items:
        raise ApodNotFoundError("Nenhum APOD para esta data.")
    return items[0]


range_cache = TTLCache(maxsize=64, ttl=3600)
@cached(cache=range_cache)
def get_apod_range(start: date, end: date) -> list[ApodItem]:
    items = valid_items(fetch_between(start, end))
    return sorted(items, key=lambda item: item.date, reverse=True)


total_cache = TTLCache(maxsize=1, ttl=86400)
@cached(cache=total_cache)
def _apod_total() -> int:
    total = int_header(basic_request({"per_page": 1}), "X-WP-Total", 0)
    if total < 1:
        raise ApiServerError("Resposta inválida da NASA")
    return total


def get_random_apods(count: int) -> list[ApodItem]:
    total = _apod_total()
    pages = random.sample(range(1, total + 1), min(count, total))
    with ThreadPoolExecutor(max_workers=min(len(pages), RANDOM_WORKERS)) as pool:
        raws = list(pool.map(fetch_position, pages))
    return valid_items([raw for raw in raws if raw is not None])
