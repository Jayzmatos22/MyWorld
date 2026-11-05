''' Limites do rate limit. Por cliente (IP anonimizado), folgados para uma casa ou empresa
inteira atrás do mesmo IP e apertados o bastante para cortar um script. As regras globais
(per_client=False) valem para todos somados: protegem as cotas pagas mesmo contra muitos IPs '''
from dataclasses import dataclass


@dataclass(frozen=True)
class RateRule:
    name: str           # entra na chave do contador: regras diferentes não se somam
    limit: int
    window: int         # segundos
    message: str
    per_client: bool = True
    # Banco fora/sem capacidade: True deixa passar (só loga). Para rotas que não podem cair junto
    fail_open: bool = False


MINUTE = 60
DAY = 86_400

LIKE_RULES = (
    RateRule("likes", 30, MINUTE, "Muitas curtidas seguidas. Espere um pouco."),
    RateRule("likes-day", 500, DAY, "Limite diário de curtidas atingido. Volte amanhã."),
)

# O chat gasta as chaves de IA: limite por cliente e um teto global por dia
CHAT_RULES = (
    RateRule("chat-min", 6, MINUTE, "Muitas perguntas seguidas. Espere um minuto."),
    RateRule("chat-day", 60, DAY, "Limite diário de perguntas atingido. Volte amanhã."),
    RateRule("chat-global", 400, DAY, "O assistente atingiu o limite de hoje. Volte amanhã.", per_client=False),
)

# Rotas que multiplicam chamadas à NASA (sorteio: até 20 por pedido; intervalo e listagem: paginadas).
# fail_open: a galeria não cai se o banco cair; o disjuntor de custo do template segura o pior caso
APOD_RANDOM_RULES = (
    RateRule("apod-random", 10, MINUTE, "Muitos sorteios seguidos. Espere um pouco.", fail_open=True),
)
APOD_LIST_RULES = (
    RateRule("apod-list", 30, MINUTE, "Muitas buscas seguidas. Espere um pouco.", fail_open=True),
)
