# Altave — Central de Ordens de Serviço

Duas pastas:

- `altave-frontend/` — React + Vite
- `backend/` — API Node/Express + Prisma (Postgres/RDS)

## Rodar local (dev)

1. Backend
   cd backend
   cp .env.example .env          # ajuste DATABASE_URL pro seu RDS (ou Postgres local)
   npm install                   # já roda `prisma generate`
   npx prisma migrate dev --name init   # cria as tabelas
   npm run seed                  # usuários de teste (senha "12345678")
   npm run dev                   # http://localhost:3001

2. Frontend
   cd altave-frontend
   cp .env.example .env
   npm install
   npm run dev                   # http://localhost:5173

Login de teste: `carlos.dias@altave.com` / `12345678` (ou joao.pedro@ / ana.ferreira@).

Detalhes de deploy no RDS e sobre o schema estão em `backend/README.md`.
