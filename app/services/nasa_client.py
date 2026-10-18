from pydantic import TypeAdapter
from models.apod import ApodResponse
from config import APOD_URL
import requests





def get_general_apod_response() -> list[ApodResponse]:
    response = requests.get(APOD_URL, timeout=10)
    response.raise_for_status()
    data = response.json()

    if not isinstance(data, list):
        raise ValueError("A resposta da API não é uma lista.")

    if data and not all(isinstance(item, dict) for item in data):
        raise ValueError("A resposta da API não contém dicionários válidos.")

    adapter = TypeAdapter(list[ApodResponse])
    return adapter.validate_python([data])[0]