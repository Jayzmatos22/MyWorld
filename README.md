<div align="center">

# MyWorld

**Um arquivo editorial do céu: a Astronomy Picture of the Day da NASA, desde 1995, com um assistente de IA para perguntar sobre o que você está vendo.**

**[Ver o site no ar →](https://d3qm8fzq1hw1xt.cloudfront.net/)**

![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.162-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![WebGL](https://img.shields.io/badge/WebGL-shader-990000?logo=webgl&logoColor=white)
<br>
![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-SAM-FF9900?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI%2BPHBhdGggZD0iTTUgMjEgMTAuNiA5LjYgOC45IDZDOC42IDUuMyA4LjEgNSA3LjQgNUg2VjNoMS42QzkgMyA5LjkgMy42IDEwLjUgNC45TDE3IDE4LjZjLjMuNi43LjkgMS40LjloLjZ2MmgtMWMtMS40IDAtMi4zLS42LTIuOS0xLjlsLTMuMy03LjJMNy40IDIxeiIvPjwvc3ZnPg%3D%3D)
![Amazon DynamoDB](https://img.shields.io/badge/Amazon_DynamoDB-free_tier-4053D6?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI%2BPGVsbGlwc2UgY3g9IjEyIiBjeT0iNSIgcng9IjgiIHJ5PSIzIi8%2BPHBhdGggZD0iTTQgOC41djNjMCAxLjcgMy42IDMgOCAzczgtMS4zIDgtM3YtM2MtMS44IDEuMy00LjggMi04IDJzLTYuMi0uNy04LTJ6Ii8%2BPHBhdGggZD0iTTQgMTV2NGMwIDEuNyAzLjYgMyA4IDNzOC0xLjMgOC0zdi00Yy0xLjggMS4zLTQuOCAyLTggMnMtNi4yLS43LTgtMnoiLz48L3N2Zz4%3D)
![Amazon S3](https://img.shields.io/badge/Amazon_S3-site-569A31?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI%2BPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNCA1YzAtMS43IDMuNi0zIDgtM3M4IDEuMyA4IDNsLTIgMTQuNWMtLjIgMS41LTIuOSAyLjUtNiAyLjVzLTUuOC0xLTYtMi41em0yLjEuMWMuNC43IDIuNyAxLjkgNS45IDEuOXM1LjUtMS4yIDUuOS0xLjljLS40LS43LTIuNy0xLjktNS45LTEuOVM2LjUgNC40IDYuMSA1LjF6Ii8%2BPC9zdmc%2B)
![Amazon CloudFront](https://img.shields.io/badge/Amazon_CloudFront-CDN-8C4FFF?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI%2BPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMmExMCAxMCAwIDEgMCAwIDIwIDEwIDEwIDAgMCAwIDAtMjB6bS0xIDIuMVY4SDcuM0E4IDggMCAwIDEgMTEgNC4xem0yIDBBOCA4IDAgMCAxIDE2LjcgOEgxM3pNNS4zIDEwSDExdjRINS4zYTggOCAwIDAgMSAwLTR6TTEzIDEwaDUuN2E4IDggMCAwIDEgMCA0SDEzem0tNS43IDZIMTF2My45QTggOCAwIDAgMSA3LjMgMTZ6bTUuNyAwaDMuN2E4IDggMCAwIDEtMy43IDMuOXoiLz48L3N2Zz4%3D)

</div>

---

## Sumário

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Stack](#stack)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Referência da API](#referência-da-api)
- [Decisões técnicas](#decisões-técnicas)
- [Deploy](#deploy)
- [Segurança](#segurança)
- [Contribuindo](#contribuindo)
- [Créditos](#créditos)

## Visão geral

O **MyWorld** apresenta cada APOD como uma "placa" de um arquivo astronômico. Cada placa traz uma composição editorial, a mídia em destaque (imagem ou vídeo), a explicação original e os metadados da observação. O projeto tem duas partes:

- **Back-end em FastAPI.** Busca e normaliza os dados do APOD no `science.nasa.gov`, com cache e tratamento de erros, serve de ponte para três provedores de LLM compatíveis com a API da OpenAI e guarda as curtidas no **Amazon DynamoDB**.
- **Front-end em React 19.** Uma SPA com TypeScript estrito, um céu animado (nebulosa em CSS e campo de estrelas em canvas) e navegação por data, intervalo, sorteio e pelo ranking das placas mais curtidas. A entrada do site é a página **Sobre**, com um buraco negro animado em **WebGL**.

Tudo roda na AWS, sem servidor fixo e dentro do nível gratuito: Lambda para a API e S3 + CloudFront para o site.

## Funcionalidades

**Páginas**

| Rota | Conteúdo |
|---|---|
| `/` | Entrada: leva direto ao Sobre |
| `/sobre` | Apresentação, metodologia, fonte e autoria, com o buraco negro animado |
| `/hoje` | Placa do dia e as seis noites anteriores |
| `/placa/:data` | Uma placa (← → navegam entre dias), com curtida e "Pergunte à placa" |
| `/galeria?de=&ate=` | Intervalo de até 31 dias, lado a lado |
| `/acaso` | Placas sorteadas de todo o acervo |
| `/favoritos` | Ranking das placas mais curtidas |

**Página Sobre**
- Abertura no estilo landing page: selo, título em duas linhas revelado por máscara e animação de entrada de cerca de 1,7 s, que espera a fonte carregar
- Buraco negro em WebGL: os anéis giram e o disco corre, enquanto o centro fica parado; as estrelas animadas do site aparecem nas partes escuras da foto
- Seções de projeto, metodologia (da coleta à infraestrutura), fonte e autoria

**Arquivo APOD**
- Placa do dia, com as seis noites anteriores
- Navegação por qualquer data desde **16/06/1995**
- Galeria por intervalo de até **31 dias**
- Seleção aleatória de 1 a 20 placas de todo o acervo
- Suporte a imagem, vídeo e mídias interativas, com URL extraída do HTML quando a NASA não fornece campo próprio

**Curtidas e ranking**
- Curtida repetível, como views: qualquer visitante pode curtir uma placa quantas vezes quiser
- Contador otimista no front, que se corrige com o valor do servidor
- Página de favoritos com o ranking da comunidade, sem depender da NASA para carregar

**Assistente de IA**
- Três provedores: **NVIDIA Build**, **Groq** e **Google AI Studio**
- Lista de provedores e modelos servida pelo back-end, que é a única fonte da verdade
- Validação de provedor e modelo no servidor, independente do que o cliente enviar
- Respostas baseadas no APOD da data, que o back-end busca (o cliente não consegue trocar o contexto)

**Proteção contra abuso**
- Rate limit por cliente: curtidas (30/min, 500/dia), chat (6/min, 60/dia), sorteio (10/min) e intervalo (30/min)
- Teto global do chat (400 perguntas/dia somando todos os IPs) para proteger as chaves de IA
- Disjuntor de custo: tráfego anormal desliga a API sozinho (ver [Segurança](#segurança))
- O IP é anonimizado com HMAC e nunca é gravado; os contadores expiram sozinhos
- Erros padronizados em `{"message", "code"}`, inclusive as falhas dos provedores de IA

## Arquitetura

```
Navegador (React SPA)
│
├─ site ──▶ CloudFront · HTTPS, CSP, cache ──▶ S3 privado (build do web/)
│
└─ API ───▶ Lambda Function URL · FastAPI + Mangum (api/)
              │  routers → services → clients
              ├──▶ science.nasa.gov ........... APOD (cache em memória)
              ├──▶ NVIDIA · Groq · Google ..... "Pergunte à placa"
              └──▶ Amazon DynamoDB ............ curtidas, ranking e rate limit

CloudWatch (alarme de invocações) ──▶ SNS ──▶ disjuntor: concorrência da API = 0

Em desenvolvimento: Vite :5173 (proxy /api) ──▶ uvicorn :8000 ──▶ DynamoDB Local :8002
```

O navegador chama a API **direto** pela Function URL, e não por dentro do CloudFront: assim o rate limit enxerga o IP real de cada visitante.

O back-end segue camadas com responsabilidades separadas:

| Camada | Responsabilidade |
|---|---|
| `routers/` | Recebe o HTTP, valida parâmetros e delega ao service |
| `services/` | Regras de negócio, cache, acesso ao DynamoDB, rate limit e orquestração das chamadas externas |
| `models/` | Schemas Pydantic de entrada e saída |
| `config/` | Configuração tipada (`Settings`), endpoints e registro de provedores |
| `exceptions/` | Exceções do domínio e handlers que as convertem em respostas HTTP padronizadas |

## Stack

| Área | Tecnologias |
|---|---|
| **Back-end** | Python 3.13, FastAPI 0.162, Pydantic v2, pydantic-settings, Requests, cachetools, BeautifulSoup, SDK `openai`, boto3 |
| **Front-end** | React 19, TypeScript 5.9 (strict), React Router 7, Tailwind CSS 4, Vite 7, Lucide, WebGL (shader próprio), Canvas 2D |
| **Infraestrutura** | AWS SAM, AWS Lambda (Python 3.13) com Function URL e Mangum, Amazon DynamoDB, Amazon S3, Amazon CloudFront, CloudWatch (logs e alarmes), SNS, AWS Budgets |
| **Desenvolvimento** | DynamoDB Local (Docker) |

## Estrutura do repositório

```
MyWorld/
├── template.yaml               # Infraestrutura: API, DynamoDB, S3, CloudFront e alertas (AWS SAM)
├── deploy.ps1                  # Deploy completo: API + front
├── .env                        # Só local (não versionado): chaves e DynamoDB Local
├── api/                        # Back-end: é só esta pasta que vai para o Lambda
│   ├── main.py                 # App FastAPI, CORS, routers, handlers e entrypoint do Lambda (Mangum)
│   ├── requirements.txt        # Dependências de produção
│   ├── requirements-dev.txt    # + uvicorn, boto3 e utilitários de desenvolvimento
│   ├── scripts/
│   │   └── create_local_table.py # Cria a tabela no DynamoDB Local
│   └── app/
│       ├── config/
│       │   ├── settings.py     # Settings: variáveis de ambiente / .env
│       │   ├── nasa.py         # Endpoints da NASA
│       │   ├── llm.py          # Registro dos provedores de IA
│       │   └── rate_limit.py   # Regras do rate limit (limite e janela)
│       ├── exceptions/
│       │   ├── base.py         # AppError: status, code e mensagem padrão
│       │   ├── nasa.py · llm.py · request.py · database.py
│       │   └── handlers.py     # Exceção → {"message", "code"}
│       ├── models/
│       │   ├── nasa/apod.py    # ApodResponse (bruto) e ApodItem (para o front)
│       │   ├── llm/llm_models.py # ChatRequest, ChatResponse, Provider, ProviderOption
│       │   └── likes/likes.py  # LikeCount, RankedPlate
│       ├── routers/
│       │   ├── nasa/apod.py    # /apod
│       │   ├── llm/llm.py      # /llm
│       │   └── likes/likes.py  # /likes
│       └── services/
│           ├── nasa/
│           │   ├── client.py   # HTTP, paginação e tratamento de erros da NASA
│           │   ├── parser.py   # JSON bruto → ApodItem
│           │   └── apod_service.py # Funções públicas com cache
│           ├── llm/
│           │   ├── llm_integration.py # Chamada aos provedores e tradução dos erros
│           │   └── prompts.py  # Prompt com o APOD como contexto
│           ├── db/dynamo.py    # Tabela do DynamoDB e tradução dos erros do boto3
│           ├── likes/likes_service.py # Curtir, contar e ranking
│           └── rate_limit/rate_limit.py # Janela fixa no DynamoDB, IP anonimizado
└── web/                        # Front-end (detalhes em web/README.md)
    └── src/
        ├── pages/              # Sobre, Hoje, Detalhes, Galeria, Acaso, Favoritos
        ├── components/about/   # Abertura do Sobre: foto + movimento
        ├── lib/blackHoleFlow.ts # Animação WebGL do buraco negro
        ├── lib/starfield.ts    # Campo de estrelas (Canvas 2D)
        └── assets/about/       # Foto do Sobre em 4 larguras (19 a 165 KB)
```

## Como rodar localmente

### Pré-requisitos

- **Python 3.13**
- **Node.js 20.19+** (exigido pelo Vite 7)
- **Docker**, para o DynamoDB Local (curtidas, ranking e rate limit do chat)
- Chave de API de pelo menos um provedor de IA, se for usar o assistente

### 1. Back-end

```bash
# na raiz do repositório
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

pip install -r api/requirements-dev.txt
```

Crie um arquivo `.env` na **raiz** do repositório, fora de `api/` (veja [Variáveis de ambiente](#variáveis-de-ambiente)):

```dotenv
# Provedores de IA (configure só os que for usar)
NVIDIA_API_KEY=...
GROQ_API_KEY=...
GOOGLE_API_KEY=...

# DynamoDB Local (curtidas e rate limit)
DYNAMODB_ENDPOINT=http://localhost:8002
```

Curtidas, ranking e o rate limit do chat usam DynamoDB. Localmente, rode o DynamoDB Local e crie a tabela uma vez:

```bash
docker run -p 8002:8000 amazon/dynamodb-local   # 8002: a 8000 é da API
python api/scripts/create_local_table.py
```

Inicie a API:

```bash
uvicorn main:app --app-dir api --reload    # ou: cd api && uvicorn main:app --reload
```

- API: `http://127.0.0.1:8000`
- Documentação interativa (Swagger): `http://127.0.0.1:8000/docs`

### 2. Front-end

```bash
cd web
npm install
npm run dev
```

O front sobe em `http://localhost:5173` e abre no Sobre; a placa do dia fica em `/hoje`. Em desenvolvimento, o Vite encaminha `/api/*` para `http://127.0.0.1:8000`, sem precisar de CORS.

| Script | Ação |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checagem de tipos + build de produção |
| `npm run typecheck` | Só a checagem de tipos |
| `npm run lint` | ESLint |
| `npm run preview` | Serve o build localmente |

### Problemas comuns

| Sintoma | Causa e solução |
|---|---|
| `"O banco de dados não respondeu"` ao curtir ou perguntar | DynamoDB Local parado ou `DYNAMODB_ENDPOINT` ausente no `.env`. Rode `docker start dynamodb-local` e confirme a variável |
| Mudei o `.env` e nada mudou | O `--reload` só observa o código. Pare o uvicorn (Ctrl+C) e suba de novo |
| A API parece ignorar o código novo | Pode haver outro uvicorn antigo na porta 8000. No Windows: `netstat -ano \| findstr :8000` e `taskkill /PID <pid> /T /F` |
| `python-dotenv could not parse statement` | Comentários no `.env` usam `#`, não `'''` |
| O buraco negro do Sobre não se mexe | Sem WebGL ou com "reduzir movimento" ligado no sistema, a página mostra a foto estática de propósito |

## Variáveis de ambiente

### Back-end (`.env` na raiz, ou variáveis do Lambda)

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `NVIDIA_API_KEY` | Para usar NVIDIA | — | Chave do NVIDIA Build |
| `GROQ_API_KEY` | Para usar Groq | — | Chave do Groq |
| `GOOGLE_API_KEY` | Para usar Google | — | Chave do Google AI Studio |
| `STANDARD_NVIDIA_MODEL` | Não | `openai/gpt-oss-20b` | Modelo padrão da NVIDIA |
| `GROQ_STANDARD_MODEL` | Não | `openai/gpt-oss-20b` | Modelo padrão do Groq |
| `GOOGLE_STANDARD_MODEL` | Não | `gemini-3.5-flash` | Modelo padrão do Google |
| `CORS_ORIGINS` | Em produção | `["http://localhost:5173"]` | Origens liberadas, em formato JSON (no Lambda, o template preenche com o CloudFront) |
| `TABLE_NAME` | Não | `myworld-local` | Tabela do DynamoDB (no Lambda, o template injeta) |
| `DYNAMODB_ENDPOINT` | Só local | — | Endpoint do DynamoDB Local |
| `RATE_LIMIT_SECRET` | Em produção | chave aleatória por processo | Chave do HMAC que anonimiza os IPs no rate limit |
| `ENABLE_DOCS` | Não | `true` | `/docs`, `/redoc` e `/openapi.json`; o template define `false` em produção |

O arquivo APOD **não precisa de chave**: o `science.nasa.gov` é público. As chaves de IA são lidas como `SecretStr` e nunca aparecem em logs nem em respostas da API.

### Front-end (`web/.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `/api` | URL base da API. Em produção, o `deploy.ps1` preenche com a Function URL. |

> **Nunca versione o `.env`.** Ele já está no `.gitignore`. Use o `web/.env.example` como modelo.

## Referência da API

A documentação interativa completa fica em `/docs` (Swagger) e `/redoc`, só em desenvolvimento: em produção, o `ENABLE_DOCS=false` desliga as duas.

### APOD

| Método | Rota | Parâmetros | Descrição |
|---|---|---|---|
| `GET` | `/apod/today` | — | APOD do dia. Se a NASA ainda não publicou, devolve o do dia anterior. |
| `GET` | `/apod/date/{day}` | `day`: `AAAA-MM-DD` | APOD de uma data (a partir de 1995-06-16) |
| `GET` | `/apod/range` | `start`, `end`: `AAAA-MM-DD` | Intervalo de até 31 dias, do mais recente para o mais antigo |
| `GET` | `/apod/random` | `count`: 1–20 (padrão 8) | Placas sorteadas de todo o acervo |
| `GET` | `/apod` | `page` (≥1), `per_page` (1–50) | Listagem paginada no formato bruto da NASA |

<details>
<summary>Exemplo de resposta (<code>ApodItem</code>)</summary>

```json
{
  "date": "2026-01-01",
  "title": "M83: The Southern Pinwheel",
  "explanation": "…",
  "media_type": "image",
  "url": "https://assets.science.nasa.gov/…/M83.jpg",
  "hdurl": "https://assets.science.nasa.gov/…/M83.jpg",
  "thumbnail_url": null,
  "copyright": "Aldo Zanetti"
}
```

`media_type` é `image`, `video` ou `other`. No caso de `other`, `url` aponta para a página original na NASA.
</details>

### Assistente de IA

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/llm/providers` | Provedores disponíveis e os modelos liberados de cada um |
| `POST` | `/llm/chat` | Envia uma pergunta ao provedor e modelo escolhidos |

```bash
curl -X POST http://127.0.0.1:8000/llm/chat \
  -H "Content-Type: application/json" \
  -d '{"provider": "groq", "date": "2024-01-01", "question": "Essa galáxia é rara?"}'
```

```json
{ "provider": "groq", "model": "openai/gpt-oss-20b", "response": "A descrição não menciona isso, mas em geral…" }
```

| Campo | Tipo | Regra |
|---|---|---|
| `provider` | `"nvidia" \| "groq" \| "google"` | Obrigatório |
| `question` | `string` | 1 a 2000 caracteres |
| `date` | `AAAA-MM-DD` | Obrigatório. A IA responde com base no APOD dessa data |
| `model` | `string \| null` | Opcional. Sem valor, usa o modelo padrão do provedor; com valor, precisa estar entre os modelos liberados. |

### Curtidas

Curtida repetível, como views: qualquer visitante pode curtir quantas vezes quiser, limitado a 30 por minuto e 500 por dia por IP. A página de favoritos mostra o ranking.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/likes/top` | Ranking, `limit`: 1–50 (padrão 30) |
| `GET` | `/likes/{day}` | Total de curtidas de uma data |
| `POST` | `/likes/{day}` | Soma +1 e devolve o total |

```json
{ "date": "2024-01-01", "likes": 31 }
```

### Formato de erro

Os erros do domínio seguem um envelope único, que o front trata de forma tipada:

```json
{ "message": "O intervalo máximo é de 31 dias.", "code": "bad_request" }
```

| HTTP | `code` | Quando |
|---|---|---|
| `400` | `bad_request` | Parâmetro fora das regras ou com tipo/formato errado (data, intervalo, modelo, pergunta) |
| `404` | `not_found` | Não existe APOD para a data pedida, ou rota inexistente |
| `413` | `bad_request` | Corpo do pedido acima de 16 KB |
| `429` | `rate_limited` | Limite da NASA, do provedor de IA ou da própria API (curtidas, chat, sorteio, intervalo). Inclui `Retry-After` quando disponível. |
| `503` | `unavailable` | NASA, provedor de IA ou banco indisponível, lento ou com resposta inválida |

## Decisões técnicas

- **Fonte `science.nasa.gov` em vez de `api.nasa.gov`.** Com a migração do `apod.nasa.gov` para o `science.nasa.gov`, a `api.nasa.gov/planetary/apod` passou a devolver o logo da NASA e o título "NASA Science" para qualquer data. O back-end consome a rota `apod-basic` do WordPress e normaliza a resposta.
- **Extração de mídia do HTML.** Na `apod-basic`, vídeos não têm campo próprio e APODs antigos trazem uma miniatura genérica no lugar da imagem. O `parser.py` busca o player (`iframe`/`video`) ou o link da imagem dentro do `basic_html`.
- **Dados incompletos são descartados, não propagados.** APODs sem campos obrigatórios (por exemplo, 1997-03-04) são registrados em log e ignorados, sem derrubar a requisição inteira.
- **Cache em memória com TTL por tipo de dado.** Datas passadas: 24 h. Placa do dia: 30 min, porque a NASA às vezes publica com atraso. Intervalos: 1 h.
- **Sorteio sem viés.** Com `per_page=1`, cada página da `apod-basic` é um APOD. O sorteio escolhe páginas distintas em todo o acervo e busca todas em paralelo, com até 8 threads.
- **Timeouts explícitos** (5 s de conexão, 25 s de leitura) e mapeamento de cada falha da NASA para uma exceção do domínio.
- **Rate limit no DynamoDB, sem guardar IP.** Contador por janela fixa, atualizado com uma única escrita condicional. O IP vira um HMAC com chave secreta e o registro expira por TTL. O IP vem do `requestContext` da Function URL; o `X-Forwarded-For` é ignorado, porque o cliente pode escrever qualquer coisa nele.
- **DynamoDB provisionado dentro do free tier.** 10 RCU/10 WCU na tabela e 5/5 no índice (15 de 25 grátis). Se passar disso, a tabela recusa a requisição (503) em vez de cobrar.
- **Provedores de IA como dados.** Os três provedores usam o mesmo SDK `openai`, mudando só `base_url` e chave. Adicionar um provedor é uma entrada nova em `config/llm.py`.
- **Entrada pelo Sobre.** A raiz `/` redireciona para `/sobre` com `replace`, para o "voltar" do navegador não cair de novo no redirecionamento. A placa do dia fica em `/hoje`.
- **Buraco negro animado com "flow map" em WebGL.** A foto é estática; um shader a relê a cada quadro com um pequeno deslocamento:
  - **Anéis:** giram por ângulo em volta do centro. A geometria foi medida na própria foto: um círculo ajustado à borda da sombra, com erro mediano de 1,3 px.
  - **Disco:** corre ao longo da faixa.
  - **Só o gás claro se move:** o shader lê o brilho de cada ponto, então a sombra e o fundo ficam parados.
  - **Loop sem emenda:** duas leituras defasadas se alternam num ciclo de 11 s.
  - **Leveza:** 30 quadros por segundo, resolução de até 1,5× e pausa fora da tela. Sem WebGL ou com "reduzir movimento", fica a foto estática.
- **Foto otimizada.** O original (7000×4000, 7,5 MB) vira quatro larguras em WebP, de 19 a 165 KB, servidas com `srcset`. No celular, a página baixa 45 KB.
- **Foto misturada ao céu do site.** Com `mix-blend-mode: lighten`, as estrelas animadas aparecem nas partes escuras da foto. Duas máscaras fazem a foto nascer do escuro e apagam o anel atrás do texto.
- **Abertura que espera a fonte.** A animação de entrada do Sobre só começa quando a fonte carrega, para a revelação por máscara nunca mostrar a fonte de reserva. Depois que termina, nenhuma animação nem `will-change` continua ativo.

## Deploy

Tudo fica num único stack do **AWS SAM** (`template.yaml`):

| Parte | Recursos | Custo |
|---|---|---|
| API | Lambda (`api/`, Python 3.13) + Function URL + Mangum | Free tier permanente: 1 milhão de requisições/mês |
| Banco | DynamoDB provisionado 10/10 + índice 5/5 | Free tier permanente: 25 RCU/25 WCU |
| Front | S3 privado + CloudFront (Origin Access Control, HTTPS, CSP e headers de segurança) | Free tier permanente do CloudFront: 1 TB e 10 milhões de requisições/mês; S3: frações de centavo |
| Alertas | Alarme do CloudWatch + SNS + disjuntor; AWS Budgets (com `ALERT_EMAIL`) | Free tier: 10 alarmes, 1.000 e-mails e 2 orçamentos |
| Logs | CloudWatch, retenção de 7 dias | Free tier: 5 GB/mês |

Sem domínio próprio, o site fica em `https://xxxx.cloudfront.net` e o custo é zero dentro dessas cotas.

**Pré-requisitos:** AWS CLI configurado (`aws configure`), AWS SAM CLI, Node.js e, no `.env` da raiz:

```dotenv
RATE_LIMIT_SECRET=...      # python -c "import secrets; print(secrets.token_hex(32))"
GROQ_API_KEY=...           # e/ou NVIDIA_API_KEY, GOOGLE_API_KEY (provedor sem chave fica desligado)
ALERT_EMAIL=voce@exemplo.com   # opcional: alertas de custo e do disjuntor (confirme o e-mail da AWS)
```

**Deploy** (PowerShell, na raiz):

```powershell
.\deploy.ps1              # API + front
.\deploy.ps1 -FrontOnly   # só o front, quando a API não mudou
```

O script:
1. Lê as chaves do `.env` e passa como parâmetros `NoEcho`. Nenhum segredo fica no `samconfig.toml` nem no git.
2. Roda `sam build` e `sam deploy`. Na primeira vez, o CloudFront leva de 5 a 15 minutos para ficar pronto.
3. Faz o build do front com `VITE_API_URL` = Function URL.
4. Envia para o S3 (assets com hash: cache de 1 ano; `index.html`: `no-cache`) e invalida o `index.html` no CloudFront.

O `CORS_ORIGINS` do Lambda é preenchido pelo próprio template com o endereço do CloudFront. O deploy usa o código **local**: faça o deploy a partir da `main` atualizada (`git checkout main && git pull`).

**Decisões**
- O front chama a Function URL **direto**, não por dentro do CloudFront. Pelo CloudFront, a API veria o IP do CloudFront, e o rate limit por cliente deixaria de funcionar.
- Só a pasta `api/` vai para o Lambda (pacote de cerca de 22 MB). O `web/`, o `.env` e os scripts locais ficam de fora.
- As chaves de IA viram variáveis de ambiente do Lambda, criptografadas em repouso. O Secrets Manager custaria cerca de US$ 0,40 por chave por mês.

**Checklist**
- Defina `ALERT_EMAIL` no `.env`: o template cria o orçamento de US$ 2/mês e liga os alertas do disjuntor. Confirme a inscrição no e-mail que a AWS enviar.
- A tabela do DynamoDB tem `DeletionPolicy: Retain`: apagar o stack não apaga as curtidas.
- Guarde o `RATE_LIMIT_SECRET`: trocar a chave só zera os contadores de rate limit em andamento.
- Contas criadas depois de jul/2025 começam no plano gratuito de 6 meses. Confira em aws.amazon.com/free o que acontece depois dele.

## Segurança

| Ameaça | Proteção |
|---|---|
| Script malicioso (XSS) | Nenhum HTML vindo de fora é injetado: título, explicação e respostas da IA viram texto. CSP rígida no CloudFront (`script-src 'self'`, sem `unsafe-inline`): script injetado não executa e não envia dados para outro domínio |
| Mídia de terceiros | Só YouTube e Vimeo viram player (iframe com `sandbox`); outras origens viram link. Links e vídeos só aceitam `http(s)` |
| Clickjacking | `frame-ancestors 'none'` e `X-Frame-Options: DENY` |
| Abuso por um cliente | Rate limit por IP no DynamoDB. IPv6 conta pelo `/64` (trocar de endereço não zera o limite). O IP vem do `requestContext` da AWS; o `X-Forwarded-For` é ignorado |
| Abuso das chaves de IA | Limite por IP e teto global diário no chat; pergunta de no máximo 2000 caracteres; resposta de no máximo 2000 tokens |
| DDoS e custo | Disjuntor: mais de 15.000 chamadas em 5 min (parâmetro `MaxApiRequestsPer5Min`) põe a concorrência da API em 0. A Lambda para de executar e não cobra. Budget de US$ 2/mês com alerta por e-mail. DynamoDB provisionado recusa em vez de cobrar |
| Amplificação na NASA | Rate limit no sorteio (até 20 chamadas à NASA por pedido) e no intervalo; se o banco cair, essas rotas seguem funcionando (fail-open) e o disjuntor segura o custo |
| Corpo gigante | Pedidos acima de 16 KB recebem 413 antes do parse |
| Exposição de dados | `/docs`, `/redoc` e `/openapi.json` desligados em produção; chaves como parâmetros `NoEcho`; erros dos provedores só no log |

**Se o disjuntor desligar a API** (o e-mail de alerta avisa), confira o tráfego no CloudWatch e religue:

```bash
aws lambda delete-function-concurrency --function-name <output FunctionName do stack>
```

**Limites conhecidos**
- A Function URL é pública: um ataque distribuído ainda consome a capacidade do DynamoDB (curtidas e chat ficam indisponíveis por um tempo, sem custo) até o disjuntor agir.
- Um ataque muito grande ao CloudFront pode passar da cota grátis (10 milhões de requisições/mês). O budget avisa; o plano de preço fixo gratuito do CloudFront, se disponível na conta, elimina cobrança excedente.
- Os 7 alertas moderados do `npm audit` são de ferramentas de build (ESLint) e não vão para o site.

## Contribuindo

1. Crie uma branch a partir da `main`: `feat/…`, `fix/…`, `refactor/…`, `chore/…`
2. Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`
3. Antes de abrir o PR, rode `npm run typecheck` e `npm run lint` em `web/`, e confirme que a API sobe com `uvicorn main:app --app-dir api`
4. Abra um Pull Request para a `main` com um resumo e o plano de teste

## Créditos

- Imagens, vídeos e textos das placas: **[Astronomy Picture of the Day](https://apod.nasa.gov/)**, da NASA. Os direitos de cada imagem pertencem aos autores indicados no campo `copyright`.
- Imagem de fundo da página Sobre: renderização de buraco negro. Autor e licença: _a preencher_.
- Ícones dos badges da AWS: símbolos simples desenhados para este README (as marcas da AWS não estão disponíveis no shields.io).
- Projeto de Jailton Santos ([@Jayzmatos22](https://github.com/Jayzmatos22)), independente, sem afiliação ou endosso da NASA.
