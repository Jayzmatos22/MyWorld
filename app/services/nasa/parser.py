''' Converte o JSON cru da apod-basic no ApodItem que o front consome '''
import html
import logging
import re

from pydantic import ValidationError

from app.models.nasa.apod import ApodItem, ApodResponse


logger = logging.getLogger("uvicorn.error")

EMBED_PATTERN = re.compile(r'<(?:iframe|video|source|embed)[^>]+src="([^"]+)"', re.IGNORECASE)
IMAGE_LINK_PATTERN = re.compile(r'<a[^>]+href="([^"]+\.(?:jpe?g|png|gif|webp))"', re.IGNORECASE)
# Miniatura genérica que a NASA põe no hdurl de APODs antigos sem imagem migrada
PLACEHOLDER_IMAGE = "news-thumbnail"


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


def _to_item(raw: dict) -> ApodItem | None:
    ''' None quando a NASA manda o APOD incompleto (ex.: 1997-03-04 sem media_type nem explanation) '''
    try:
        return _build_item(raw)
    except ValidationError as e:
        logger.warning("APOD %s ignorado, dados incompletos: %s", raw.get("date"), [err["loc"] for err in e.errors()])
        return None


def valid_items(raws: list[dict]) -> list[ApodItem]:
    return [item for item in map(_to_item, raws) if item is not None]
