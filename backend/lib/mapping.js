// Traduz entre os enums do banco (Prisma) e os rótulos que o front usa (pt-BR).

export const STATUS_DB_TO_API = {
  RASCUNHO: 'Rascunho',
  ABERTA: 'Aberta',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
}
export const STATUS_API_TO_DB = {
  Aberta: 'ABERTA',
  'Em andamento': 'EM_ANDAMENTO',
  Concluída: 'CONCLUIDA',
}
// Colunas que o quadro Kanban do front mostra hoje.
export const STATUS_KANBAN_DB = ['ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA']

export const PRIORIDADE_DB_TO_API = { BAIXA: 'Baixa', MEDIA: 'Média', ALTA: 'Alta', URGENTE: 'Alta' }
export const PRIORIDADE_API_TO_DB = { Baixa: 'BAIXA', Média: 'MEDIA', Alta: 'ALTA' }

export const PERFIL_LABEL = { ADMIN: 'Administrador', GESTOR: 'Gestor', EXECUTOR: 'Técnico', USUARIO: 'Usuário' }

const PALETTE = ['#2E86D8', '#D99A2B', '#1F9D55', '#8E5FD9', '#D9534F', '#17A2B8']

export function initials(nome) {
  return nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

export function colorFor(seed) {
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return PALETTE[h % PALETTE.length]
}
