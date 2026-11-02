<div align="center">

# MyWorld

**Um arquivo editorial do céu: a Astronomy Picture of the Day da NASA, desde 1995, com um assistente de IA para perguntar sobre o que você está vendo.**

![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-SAM-FF9900?logo=awslambda&logoColor=white)

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
- [Contribuindo](#contribuindo)
- [Créditos](#créditos)

## Visão geral

O **MyWorld** apresenta cada APOD como uma "placa" de um arquivo astronômico. Cada placa traz uma composição editorial, a mídia em destaque (imagem ou vídeo), a explicação original e os metadados da observação. O projeto tem duas partes:

- **Back-end em FastAPI.** Busca e normaliza os dados do APOD no `science.nasa.gov`, com cache e tratamento de erros, e serve de ponte para três provedores de LLM compatíveis com a API da OpenAI.
- **Front-end em React 19.** Uma SPA com TypeScript estrito, um céu animado (nebulosa em CSS e campo de estrelas em canvas) e navegação por data, intervalo, sorteio e favoritos.

## Funcionalidades

**Arquivo APOD**
- Placa do dia, com as seis noites anteriores
- Navegação por qualquer data desde **16/06/1995**
- Galeria por intervalo de até **31 dias**
- Seleção aleatória de 1 a 20 placas de todo o acervo
- Favoritos salvos no navegador
- Suporte a imagem, vídeo e mídias interativas, com URL extraída do HTML quando a NASA não fornece campo próprio

**Assistente de IA**
- Três provedores: **NVIDIA Build**, **Groq** e **Google AI Studio**
- Lista de provedores e modelos servida pelo back-end, que é a única fonte da verdade
- Validação de provedor e modelo no servidor, independente do que o cliente enviar

## Arquitetura

```
┌──────────────────────┐        ┌───────────────────────────────┐        ┌───────────────────────────┐
│  React SPA (Vite)    │  /api  │  FastAPI                      │        │  science.nasa.gov         │
│  web/                │ ─────▶ │  local: uvicorn               │ ─────▶ │  /wp-json/wp/v2/apod-basic│
│                      │        │  produção: AWS Lambda + Mangum│        └───────────────────────────┘
│  proxy /api → :8000  │        │                               │        ┌───────────────────────────┐
│  (só em dev)         │        │  routers → services → clients │ ─────▶ │  NVIDIA · Groq · Google   │
└──────────────────────┘        └───────────────────────────────┘        │  (API compatível OpenAI)  │
                                                                          └───────────────────────────┘
```

O back-end segue camadas com responsabilidades separadas:

| Camada | Responsabilidade |
|---|---|
| `routers/` | Recebe o HTTP, valida parâmetros e delega ao service |
| `services/` | Regras de negócio, cache e orquestração das chamadas externas |
| `models/` | Schemas Pydantic de entrada e saída |
| `config/` | Configuração tipada (`Settings`), endpoints e registro de provedores |
| `exceptions/` | Exceções do domínio e handlers que as convertem em respostas HTTP padronizadas |

## Stack

| Área | Tecnologias |
|---|---|
| **Back-end** | Python 3.13, FastAPI, Pydantic v2, pydantic-settings, Requests, cachetools, BeautifulSoup, SDK `openai` |
| **Front-end** | React 19, TypeScript 5.9 (strict), React Router 7, Tailwind CSS 4, Vite 7, Lucide |
| **Infraestrutura** | AWS Lambda (Python 3.13) via AWS SAM, Lambda Function URL, Mangum, CloudWatch Logs |

## Estrutura do repositório

```
MyWorld/
├── main.py                     # App FastAPI, CORS, routers, handlers e entrypoint do Lambda (Mangum)
├── template.yaml               # Infraestrutura (AWS SAM)
├── requirements.txt            # Dependências de produção
├── requirements-dev.txt        # + uvicorn e utilitários de desenvolvimento
├── app/
│   ├── config/
│   │   ├── settings.py         # Settings: variáveis de ambiente / .env
│   │   ├── nasa.py             # Endpoints da NASA
│   │   └── llm.py              # Registro dos provedores de IA
│   ├── exceptions/
│   │   ├── nasa.py · llm.py · request.py
│   │   └── handlers.py         # Exceção → {"message", "code"}
│   ├── models/
│   │   ├── nasa/apod.py        # ApodResponse (bruto) e ApodItem (para o front)
│   │   └── llm/llm_models.py   # ChatRequest, ChatResponse, Provider, ProviderOption
│   ├── routers/
│   │   ├── nasa/apod.py        # /apod
│   │   └── llm/llm.py          # /llm
│   └── services/
│       ├── nasa/
│       │   ├── client.py       # HTTP, paginação e tratamento de erros da NASA
│       │   ├── parser.py       # JSON bruto → ApodItem
│       │   └── apod_service.py # Funções públicas com cache
│       └── llm/
│           └── llm_integration.py
└── web/                        # Front-end (detalhes em web/README.md)
```

## Como rodar localmente

### Pré-requisitos

- **Python 3.13**
- **Node.js 20.19+** (exigido pelo Vite 7)
- Chave de API de pelo menos um provedor de IA, se for usar o assistente

### 1. Back-end

```bash
# na raiz do repositório
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

pip install -r requirements-dev.txt
```

Crie um arquivo `.env` na raiz (veja [Variáveis de ambiente](#variáveis-de-ambiente)):

```dotenv
# Provedores de IA (configure só os que for usar)
NVIDIA_API_KEY=...
GROQ_API_KEY=...
GOOGLE_API_KEY=...
```

Inicie a API:

```bash
uvicorn main:app --reload
```

- API: `http://127.0.0.1:8000`
- Documentação interativa (Swagger): `http://127.0.0.1:8000/docs`

### 2. Front-end

```bash
cd web
npm install
npm run dev
```

O front sobe em `http://localhost:5173`. Em desenvolvimento, o Vite encaminha `/api/*` para `http://127.0.0.1:8000`, sem precisar de CORS.

| Script | Ação |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checagem de tipos + build de produção |
| `npm run typecheck` | Só a checagem de tipos |
| `npm run lint` | ESLint |
| `npm run preview` | Serve o build localmente |

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
| `CORS_ORIGINS` | Em produção | `["http://localhost:5173"]` | Origens liberadas, em formato JSON |

O arquivo APOD **não precisa de chave**: o `science.nasa.gov` é público. As chaves de IA são lidas como `SecretStr` e nunca aparecem em logs nem em respostas da API.

### Front-end (`web/.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `/api` | URL base da API. Em produção, aponte para a URL do Lambda. |

> **Nunca versione o `.env`.** Ele já está no `.gitignore`. Use o `web/.env.example` como modelo.

## Referência da API

A documentação interativa completa fica em `/docs` (Swagger) e `/redoc`.

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
  -d '{"provider": "groq", "question": "O que é uma nebulosa planetária?"}'
```

```json
{ "provider": "groq", "model": "openai/gpt-oss-20b", "response": "Uma nebulosa planetária é…" }
```

| Campo | Tipo | Regra |
|---|---|---|
| `provider` | `"nvidia" \| "groq" \| "google"` | Obrigatório |
| `question` | `string` | 1 a 2000 caracteres |
| `model` | `string \| null` | Opcional. Sem valor, usa o modelo padrão do provedor; com valor, precisa estar entre os modelos liberados. |

### Formato de erro

Os erros do domínio seguem um envelope único, que o front trata de forma tipada:

```json
{ "message": "O intervalo máximo é de 31 dias.", "code": "bad_request" }
```

| HTTP | `code` | Quando |
|---|---|---|
| `400` | `bad_request` | Parâmetro fora das regras (data, intervalo, modelo, chave de IA ausente) |
| `404` | `not_found` | Não existe APOD para a data pedida |
| `429` | `rate_limited` | Limite da NASA atingido. Inclui o header `Retry-After` quando disponível. |
| `503` | `unavailable` | NASA indisponível ou com resposta inválida |

Erros de validação de schema (tipo ou formato errado) seguem o padrão do FastAPI: `422` com a lista de campos em `detail`.

## Decisões técnicas

- **Fonte `science.nasa.gov` em vez de `api.nasa.gov`.** Com a migração do `apod.nasa.gov` para o `science.nasa.gov`, a `api.nasa.gov/planetary/apod` passou a devolver o logo da NASA e o título "NASA Science" para qualquer data. O back-end consome a rota `apod-basic` do WordPress e normaliza a resposta.
- **Extração de mídia do HTML.** Na `apod-basic`, vídeos não têm campo próprio e APODs antigos trazem uma miniatura genérica no lugar da imagem. O `parser.py` busca o player (`iframe`/`video`) ou o link da imagem dentro do `basic_html`.
- **Dados incompletos são descartados, não propagados.** APODs sem campos obrigatórios (por exemplo, 1997-03-04) são registrados em log e ignorados, sem derrubar a requisição inteira.
- **Cache em memória com TTL por tipo de dado.** Datas passadas: 24 h. Placa do dia: 30 min, porque a NASA às vezes publica com atraso. Intervalos: 1 h.
- **Sorteio sem viés.** Com `per_page=1`, cada página da `apod-basic` é um APOD. O sorteio escolhe páginas distintas em todo o acervo e busca todas em paralelo, com até 8 threads.
- **Timeouts explícitos** (5 s de conexão, 25 s de leitura) e mapeamento de cada falha da NASA para uma exceção do domínio.
- **Provedores de IA como dados.** Os três provedores usam o mesmo SDK `openai`, mudando só `base_url` e chave. Adicionar um provedor é uma entrada nova em `config/llm.py`.

## Deploy

O back-end roda como uma função **AWS Lambda** com **Function URL**, provisionada por **AWS SAM**. O `main.handler` usa o Mangum para adaptar o FastAPI ao Lambda.

```bash
sam build
sam deploy --guided   # na primeira vez; depois, apenas: sam deploy
```

A URL pública aparece no output `Url` do stack.

**Checklist de produção**
- Configure as chaves de IA e o `CORS_ORIGINS` no Lambda. O `.env` é só para desenvolvimento; para chaves, prefira o AWS Secrets Manager.
- Confirme que o `.env` não é empacotado no artefato do SAM: o `CodeUri: ./` inclui a pasta inteira, e o `.gitignore` não vale para o SAM.
- A Function URL está com `AuthType: NONE` (pública). Avalie limitar a taxa de requisições no `/llm/chat`, que consome cota paga dos provedores.
- Gere o build do front com `VITE_API_URL` apontando para a URL do Lambda: `VITE_API_URL=https://… npm run build`.

## Contribuindo

1. Crie uma branch a partir da `main`: `feat/…`, `fix/…`, `refactor/…`, `chore/…`
2. Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`
3. Antes de abrir o PR, rode `npm run typecheck` e `npm run lint` em `web/`, e confirme que a API sobe com `uvicorn main:app`
4. Abra um Pull Request para a `main` com um resumo e o plano de teste

## Créditos

- Imagens, vídeos e textos: **[Astronomy Picture of the Day](https://apod.nasa.gov/)**, da NASA. Os direitos de cada imagem pertencem aos autores indicados no campo `copyright`.
- Este é um projeto independente, sem afiliação ou endosso da NASA.
