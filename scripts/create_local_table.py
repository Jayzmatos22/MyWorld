''' Cria no DynamoDB Local a mesma tabela do template.yaml.

    docker run -p 8002:8000 amazon/dynamodb-local     # 8002: a 8000 é da API
    # .env: DYNAMODB_ENDPOINT=http://localhost:8002
    python scripts/create_local_table.py
'''
import sys
from pathlib import Path

import boto3

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.config import settings  # noqa: E402


def main() -> None:
    if not settings.dynamodb_endpoint:
        sys.exit("Defina DYNAMODB_ENDPOINT no .env: este script só cria a tabela local.")

    # O DynamoDB Local aceita qualquer credencial
    client = boto3.client(
        "dynamodb",
        region_name=settings.aws_region,
        endpoint_url=settings.dynamodb_endpoint,
        aws_access_key_id="local",
        aws_secret_access_key="local",
    )
    if settings.table_name in client.list_tables()["TableNames"]:
        print(f"Tabela {settings.table_name} já existe.")
        return

    capacity = {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
    client.create_table(
        TableName=settings.table_name,
        BillingMode="PROVISIONED",
        ProvisionedThroughput=capacity,
        AttributeDefinitions=[
            {"AttributeName": "pk", "AttributeType": "S"},
            {"AttributeName": "rank_pk", "AttributeType": "S"},
            {"AttributeName": "likes", "AttributeType": "N"},
        ],
        KeySchema=[{"AttributeName": "pk", "KeyType": "HASH"}],
        GlobalSecondaryIndexes=[{
            "IndexName": "by-likes",
            "KeySchema": [
                {"AttributeName": "rank_pk", "KeyType": "HASH"},
                {"AttributeName": "likes", "KeyType": "RANGE"},
            ],
            "Projection": {"ProjectionType": "ALL"},
            "ProvisionedThroughput": capacity,
        }],
    )
    client.get_waiter("table_exists").wait(TableName=settings.table_name)
    client.update_time_to_live(
        TableName=settings.table_name,
        TimeToLiveSpecification={"AttributeName": "expires_at", "Enabled": True},
    )
    print(f"Tabela {settings.table_name} criada em {settings.dynamodb_endpoint}.")


if __name__ == "__main__":
    main()
