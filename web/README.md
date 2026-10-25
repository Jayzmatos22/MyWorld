# myPlanet — web

Front-end do arquivo APOD (React 19 + TypeScript estrito + Tailwind v4 + Vite).

## Rodando

```bash
# 1. back-end (na raiz do repositório)
pip install -r requirements.txt uvicorn
uvicorn main:app --reload          # http://localhost:8000

# 2. front-end
cd web
npm install
npm run dev                         # http://localhost:5173 (proxy /api → :8000)
```

Scripts: `npm run build`, `npm run typecheck`, `npm run lint`.

## Estrutura

```
src/
  api/          tipos da API, validação em runtime, cliente e erros tipados
  hooks/        useQuery (cache), useApod*, useFavorites, useStarfield, useReveal…
  lib/          lógica pura: datas, cache, favoritos, motor do campo de estrelas
  components/
    sky/        nebulosa (CSS @property) + estrelas (canvas)
    layout/     cabeçalho, rodapé, busca por data
    plate/      placa em destaque, mídia, folha de contato
    ui/         botões, estados (skeleton, erro, vazio), reveal
  pages/        Hoje, Detalhes, Galeria, Acaso, Favoritos
  styles/       tokens (@theme), base, nebulosa, movimento
```

## Rotas

| Rota | Conteúdo |
|---|---|
| `/` | Placa do dia + seis noites anteriores |
| `/placa/:data` | Detalhes (← → navegam entre dias) |
| `/galeria?de=&ate=` | Intervalo de até 31 dias |
| `/acaso` | 8 placas aleatórias |
| `/favoritos` | Favoritos salvos no navegador |
