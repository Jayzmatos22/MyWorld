from pydantic import TypeAdapter
from app.models.apod import ApodResponse, ApodItem
from app.config import APOD_URL
from app.exceptions import ApiServerError, ApodNotFoundError, RateLimitError
from pydantic import ValidationError
from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta
import html
import logging
import random
import re
import requests
from cachetools import TTLCache, cached


logger = logging.getLogger("uvicorn.error")

# (conexão, leitura) em segundos: a NASA às vezes passa de 10s
NASA_TIMEOUT = (5, 25)


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


''' science.nasa.gov/wp-json/wp/v2/apod-basic
A api.nasa.gov/planetary/apod quebrou com a migração do apod.nasa.gov para o science.nasa.gov:
devolve o logo da NASA e o título "NASA Science" para qualquer data. '''

APOD_PAGE_SIZE = 25  # Máximo da rota: per_page maior é ignorado
RANDOM_WORKERS = 8
EMBED_PATTERN = re.compile(r'<(?:iframe|video|source|embed)[^>]+src="([^"]+)"', re.IGNORECASE)
IMAGE_LINK_PATTERN = re.compile(r'<a[^>]+href="([^"]+\.(?:jpe?g|png|gif|webp))"', re.IGNORECASE)
# Miniatura genérica que a NASA põe no hdurl de APODs antigos sem imagem migrada
PLACEHOLDER_IMAGE = "news-thumbnail"


def _apod_param(day: date) -> str:
    ''' date_from/date_to só aceitam o formato do arquivo clássico (ap210101 -> 210101) '''
    return day.strftime("%y%m%d")


def _int_header(response: requests.Response, name: str, default: int) -> int:
    value = response.headers.get(name, "")
    return int(value) if value.isdigit() else default


def _basic_request(params: dict[str, str | int]) -> requests.Response:
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


def _json_list(response: requests.Response) -> list[dict]:
    try:
        data = response.json()
    except ValueError as e:
        raise ApiServerError("Resposta inválida da NASA") from e
    if not isinstance(data, list):
        raise ApiServerError("Resposta inválida da NASA")
    return data


def _embed_url(basic_html: str | None) -> str | None:
    ''' Vídeos não têm campo próprio: o player vem num iframe dentro do basic_html '''
    match = EMBED_PATTERN.search(basic_html or "")
    if not match:
        return None
    src = html.unescape(match.group(1))
    return f"https:{src}" if src.startswith("//") else src


def _image_url(hdurl: str, basic_html: str | None) -> str | None:
    ''' Nesta rota "url" é a página do artigo; a imagem vem em "hdurl" ou, nos antigos, só no basic_html '''
    if hdurl and PLACEHOLDER_IMAGE not in hdurl:
        return hdurl
    match = IMAGE_LINK_PATTERN.search(basic_html or "")
    return html.unescape(match.group(1)) if match else None


def _to_item(raw: dict) -> ApodItem | None:
    ''' None quando a NASA manda o APOD incompleto (ex.: 1997-03-04 sem media_type nem explanation) '''
    try:
        return _build_item(raw)
    except ValidationError as e:
        logger.warning("APOD %s ignorado, dados incompletos: %s", raw.get("date"), [err["loc"] for err in e.errors()])
        return None


def _valid_items(raws: list[dict]) -> list[ApodItem]:
    return [item for item in map(_to_item, raws) if item is not None]


def _build_item(raw: dict) -> ApodItem:
    apod = ApodResponse.model_validate(raw)
    base = {"date": apod.date, "title": apod.title, "explanation": apod.explanation, "copyright": apod.copyright}

    image = _image_url(apod.hdurl, raw.get("basic_html")) if apod.media_type == "image" else None
    if image:
        return ApodItem(**base, media_type="image", url=image, hdurl=image)

    embed = _embed_url(raw.get("basic_html")) if apod.media_type == "video" else None
    if embed:
        return ApodItem(**base, media_type="video", url=embed)

    return ApodItem(**base, media_type="other", url=apod.permalink)


def _fetch_between(start: date, end: date) -> list[dict]:
    params = {"date_from": _apod_param(start), "date_to": _apod_param(end), "per_page": APOD_PAGE_SIZE}
    raws: list[dict] = []
    page, total_pages = 1, 1
    while page <= total_pages:
        response = _basic_request({**params, "page": page})
        raws = [*raws, *_json_list(response)]
        total_pages = _int_header(response, "X-WP-TotalPages", 1)
        page += 1
    return raws


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
    items = _valid_items(_fetch_between(day, day))
    if not items:
        raise ApodNotFoundError("Nenhum APOD para esta data.")
    return items[0]


range_cache = TTLCache(maxsize=64, ttl=3600)
@cached(cache=range_cache)
def get_apod_range(start: date, end: date) -> list[ApodItem]:
    items = _valid_items(_fetch_between(start, end))
    return sorted(items, key=lambda item: item.date, reverse=True)


total_cache = TTLCache(maxsize=1, ttl=86400)
@cached(cache=total_cache)
def _apod_total() -> int:
    total = _int_header(_basic_request({"per_page": 1}), "X-WP-Total", 0)
    if total < 1:
        raise ApiServerError("Resposta inválida da NASA")
    return total


def _fetch_position(page: int) -> dict | None:
    ''' Com per_page=1 cada página é um APOD: sortear páginas = sortear APODs '''
    items = _json_list(_basic_request({"per_page": 1, "page": page}))
    return items[0] if items else None


def get_random_apods(count: int) -> list[ApodItem]:
    total = _apod_total()
    pages = random.sample(range(1, total + 1), min(count, total))
    with ThreadPoolExecutor(max_workers=min(len(pages), RANDOM_WORKERS)) as pool:
        raws = list(pool.map(_fetch_position, pages))
    return _valid_items([raw for raw in raws if raw is not None])
