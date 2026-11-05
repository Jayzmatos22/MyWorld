''' Acesso ao DynamoDB: uma tabela só, com as curtidas e os contadores do rate limit '''
import logging
from collections.abc import Iterator
from contextlib import contextmanager
from functools import lru_cache

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

from app.config import settings
from app.exceptions.database import DatabaseUnavailableError


logger = logging.getLogger("uvicorn.error")

# Timeouts curtos e poucas tentativas: o Lambda corta em 30s e o chat ainda chama a IA depois
BOTO_CONFIG = Config(connect_timeout=2, read_timeout=3, retries={"max_attempts": 2, "mode": "standard"})
THROTTLED = {"ProvisionedThroughputExceededException", "ThrottlingException", "RequestLimitExceeded"}


@lru_cache
def get_table():
    # O DynamoDB Local aceita qualquer credencial; na AWS vale a role do Lambda
    local = {"aws_access_key_id": "local", "aws_secret_access_key": "local"} if settings.dynamodb_endpoint else {}
    resource = boto3.resource(
        "dynamodb",
        region_name=settings.aws_region,
        endpoint_url=settings.dynamodb_endpoint,
        config=BOTO_CONFIG,
        **local,
    )
    return resource.Table(settings.table_name)


def error_code(exc: ClientError) -> str:
    return exc.response.get("Error", {}).get("Code", "")


@contextmanager
def dynamo_errors(action: str) -> Iterator[None]:
    ''' Converte falhas do boto3 em 503. Quem precisa tratar um código específico
    (ex.: ConditionalCheckFailedException) captura antes, dentro do bloco '''
    try:
        yield
    except ClientError as e:
        code = error_code(e)
        logger.warning("DynamoDB %s falhou: %s", action, code)
        # Capacidade provisionada esgotada: a tabela recusa em vez de cobrar
        message = "Muito movimento agora. Tente de novo em instantes." if code in THROTTLED else None
        raise DatabaseUnavailableError(message) from e
    except BotoCoreError as e:
        logger.warning("DynamoDB %s sem conexão: %s", action, type(e).__name__)
        raise DatabaseUnavailableError() from e
