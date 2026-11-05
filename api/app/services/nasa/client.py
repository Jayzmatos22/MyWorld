''' Requisições HTTP à rota apod-basic do science.nasa.gov '''
from datetime import date
import logging

import requests

from app.config.nasa import APOD_URL
from app.exceptions import ApiServerError, RateLimitError


logger = logging.getLogger("uvicorn.error")

# (conexão, leitura) em segundos: a NASA às vezes passa de 10s
NASA_TIMEOUT = (5, 25)
APOD_PAGE_SIZE = 25  # Máximo da rota: per_page maior é ignorado


def apod_param(day: date) -> str:
    ''' date_from/date_to só aceitam o formato do arquivo clássico (ap210101 -> 210101) '''
    return day.strftime("%y%m%d")


def int_header(response: requests.Response, name: str, default: int) -> int:
    value = response.headers.get(name, "")
    return int(value) if value.isdigit() else default


def basic_request(params: dict[str, str | int]) -> requests.Response:
    try:
        response = requests.get(APOD_URL, params=params, timeout=NASA_TIMEOUT)
    except requests.RequestException as e:
        logger.warning("NASA apod-basic %s falhou: %s", params, type(e).__name__)
        raise ApiServerError("NASA indisponível") from e

    if response.status_code == 429:
        retry_after = response.headers.get("Retry-After")
        raise RateLimitError(int(retry_after) if retry_after and retry_after.isdigit() else None)
    if not response.ok:
        logger.warning("NASA apod-basic %s respondeu HTTP %s", params, response.status_code)
        raise ApiServerError("NASA indisponível")
    return response


def json_list(response: requests.Response) -> list[dict]:
    try:
        data = response.json()
    except ValueError as e:
        raise ApiServerError("Resposta inválida da NASA") from e
    if not isinstance(data, list):
        raise ApiServerError("Resposta inválida da NASA")
    return data


def fetch_between(start: date, end: date) -> list[dict]:
    params = {"date_from": apod_param(start), "date_to": apod_param(end), "per_page": APOD_PAGE_SIZE}
    raws: list[dict] = []
    page, total_pages = 1, 1
    while page <= total_pages:
        response = basic_request({**params, "page": page})
        raws = [*raws, *json_list(response)]
        total_pages = int_header(response, "X-WP-TotalPages", 1)
        page += 1
    return raws


def fetch_position(page: int) -> dict | None:
    ''' Com per_page=1 cada página é um APOD: sortear páginas = sortear APODs '''
    items = json_list(basic_request({"per_page": 1, "page": page}))
    return items[0] if items else None
