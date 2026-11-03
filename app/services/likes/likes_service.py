''' Curtidas: contador global por APOD, repetível (como views), e o ranking da página de favoritos '''
from datetime import date

from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

from app.models.likes.likes import LikeCount, RankedPlate
from app.models.nasa.apod import ApodItem
from app.services.db.dynamo import dynamo_errors, error_code, get_table
from app.services.nasa import get_apod_by_date


RANK_PK = "LIKES"           # partição única do índice: todo APOD curtido entra no ranking
RANK_INDEX = "by-likes"


def apod_pk(day: date) -> str:
    return f"APOD#{day.isoformat()}"


def preview(apod: ApodItem) -> str | None:
    ''' Mesma regra do previewSrc do front '''
    if apod.media_type == "image":
        return apod.url
    if apod.media_type == "video":
        return apod.thumbnail_url
    return None


def get_likes(day: date) -> LikeCount:
    with dynamo_errors("get likes"):
        item = get_table().get_item(Key={"pk": apod_pk(day)}, ProjectionExpression="likes").get("Item")
    return LikeCount(date=day, likes=int(item["likes"]) if item else 0)


def first_like(day: date) -> dict:
    ''' APOD ainda fora da tabela: o back-end busca título e prévia (o front manda só a data,
    então ninguém grava título ou link falso). Duas primeiras curtidas juntas não se perdem: ADD é atômico '''
    apod = get_apod_by_date(day)
    return get_table().update_item(
        Key={"pk": apod_pk(day)},
        UpdateExpression="ADD likes :one SET rank_pk = :rank, #date = :date, title = :title, "
                         "media_type = :media, thumb = :thumb",
        ExpressionAttributeNames={"#date": "date"},
        ExpressionAttributeValues={
            ":one": 1,
            ":rank": RANK_PK,
            ":date": day.isoformat(),
            ":title": apod.title,
            ":media": apod.media_type,
            ":thumb": preview(apod),
        },
        ReturnValues="UPDATED_NEW",
    )["Attributes"]


def add_like(day: date) -> LikeCount:
    ''' Caminho comum: só soma, sem chamar a NASA. Só a primeira curtida busca o APOD '''
    with dynamo_errors("add like"):
        try:
            attributes = get_table().update_item(
                Key={"pk": apod_pk(day)},
                UpdateExpression="ADD likes :one",
                ConditionExpression="attribute_exists(pk)",
                ExpressionAttributeValues={":one": 1},
                ReturnValues="UPDATED_NEW",
            )["Attributes"]
        except ClientError as e:
            if error_code(e) != "ConditionalCheckFailedException":
                raise
            attributes = first_like(day)
    return LikeCount(date=day, likes=int(attributes["likes"]))


def top_likes(limit: int) -> list[RankedPlate]:
    with dynamo_errors("ranking"):
        items = get_table().query(
            IndexName=RANK_INDEX,
            KeyConditionExpression=Key("rank_pk").eq(RANK_PK),
            ScanIndexForward=False,         # mais curtidos primeiro
            Limit=limit,
        )["Items"]
    return [
        RankedPlate(
            date=item["date"],
            title=item["title"],
            media_type=item["media_type"],
            thumb=item.get("thumb"),
            likes=int(item["likes"]),
        )
        for item in items
    ]
