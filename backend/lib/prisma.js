import { PrismaClient } from '@prisma/client'

// Client unico do Prisma. Todas as rotas importam esse `prisma` — nunca
// abrem conexao direto. A URL do banco (RDS) vem de DATABASE_URL no .env.
export const prisma = new PrismaClient()
