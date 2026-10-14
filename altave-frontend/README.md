# Altave — Central de Ordens de Serviço (front)

## Rodar
npm install
npm run dev

## Backend / RDS
Front NÃO conversa direto com RDS. Precisa de uma API (Node/Express, Lambda+API Gateway etc)
na frente do Postgres/MySQL do RDS, expondo:
  POST /auth/login
  GET  /ordens
  POST /ordens
  PATCH /ordens/:id/status

Aponte o front pra ela via env var VITE_API_URL (arquivo .env):
  VITE_API_URL=https://sua-api.com/api

Toda a integração fica isolada em src/services/api.js — troque os mocks
(src/data/mockData.js) pelas chamadas do api.js quando o backend estiver pronto.

## Estrutura
src/pages     -> Login, Kanban, Relatorios, Manual
src/components -> Layout (sidebar+topbar), NovaOrdemModal
src/data      -> mocks
src/services  -> api.js (unico ponto de rede)
