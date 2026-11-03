''' Rate limit por janela fixa. O contador fica no DynamoDB para valer em todas as
instâncias do Lambda (memória local zera a cada cold start e não é compartilhada) '''
import hashlib
import hmac
import logging
import math
import secrets
import time
from collections.abc import Callable
from functools import lru_cache

from botocore.exceptions import ClientError
from fastapi import Request

from app.config import settings
from app.config.rate_limit import RateRule
from app.exceptions.request import TooManyRequestsError
from app.services.db.dynamo import dynamo_errors, error_code, get_table


logger = logging.getLogger("uvicorn.error")

TTL_MARGIN = 60   # o TTL do DynamoDB apaga com atraso; quem fecha a janela é a chave, não o TTL


@lru_cache
def secret_key() -> bytes:
    if settings.rate_limit_secret:
        return settings.rate_limit_secret.get_secret_value().encode()
    logger.warning("RATE_LIMIT_SECRET ausente: usando chave temporária (só serve em desenvolvimento)")
    return secrets.token_bytes(32)


def client_key(request: Request) -> str:
    ''' IP vira HMAC: dá para contar sem guardar o IP (LGPD).
    Na Function URL o IP vem do requestContext da AWS (o Mangum põe em request.client);
    X-Forwarded-For é ignorado de propósito, o cliente escreve o que quiser nele '''
    ip = request.client.host if request.client else "unknown"
    return hmac.new(secret_key(), ip.encode(), hashlib.sha256).hexdigest()[:32]


def hit(rule: RateRule, key: str, now: float | None = None) -> None:
    ''' Soma 1 na janela atual só se ainda estiver abaixo do limite: uma escrita, atômica '''
    now = time.time() if now is None else now
    window = int(now // rule.window)
    reset_at = (window + 1) * rule.window
    with dynamo_errors(f"rate limit {rule.name}"):
        try:
            get_table().update_item(
                Key={"pk": f"RATE#{rule.name}#{key}#{window}"},
                UpdateExpression="ADD hits :one SET expires_at = :exp",
                ConditionExpression="attribute_not_exists(hits) OR hits < :limit",
                ExpressionAttributeValues={":one": 1, ":limit": rule.limit, ":exp": reset_at + TTL_MARGIN},
            )
        except ClientError as e:
            if error_code(e) != "ConditionalCheckFailedException":
                raise
            raise TooManyRequestsError(rule.message, retry_after=max(1, math.ceil(reset_at - now))) from e


def rate_limit(*rules: RateRule) -> Callable[[Request], None]:
    ''' Dependência do FastAPI: dependencies=[Depends(rate_limit(*LIKE_RULES))] '''
    def check(request: Request) -> None:
        key = client_key(request)
        for rule in rules:
            hit(rule, key)
    return check
