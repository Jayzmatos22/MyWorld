from pydantic import TypeAdapter
from app.models.apod import ApodResponse
from app.config import APOD_URL
from app.exceptions import ApiServerError
from pydantic import ValidationError
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