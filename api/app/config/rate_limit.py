''' Limites por cliente (IP anonimizado). Folgados para uma casa ou empresa inteira
atrás do mesmo IP, apertados o bastante para cortar um script '''
from dataclasses import dataclass


@dataclass(frozen=True)
class RateRule:
    name: str           # entra na chave do contador: regras diferentes não se somam
    limit: int
    window: int         # segundos
    message: str


LIKE_RULES = (
    RateRule("likes", 30, 60, "Muitas curtidas seguidas. Espere um pouco."),
)

# O chat gasta as chaves de IA: limite por minuto e por dia
CHAT_RULES = (
    RateRule("chat-min", 6, 60, "Muitas perguntas seguidas. Espere um minuto."),
    RateRule("chat-day", 60, 86_400, "Limite diário de perguntas atingido. Volte amanhã."),
)
