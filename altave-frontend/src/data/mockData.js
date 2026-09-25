// Dados mockados so pra o front funcionar sozinho.
// Troque por chamadas em src/services/api.js quando a API (RDS por tras)
// estiver no ar. Front NUNCA fala direto com RDS - precisa de um backend
// (Node/Express, Lambda, etc) expondo REST/API na frente do banco.

export const USERS = {
  'carlos.dias': { id: 'CD', name: 'Carlos Dias', role: 'Gestor', color: '#2E86D8' },
  'joao.pedro': { id: 'JP', name: 'João Pedro', role: 'Técnico', color: '#D99A2B' },
  'ana.ferreira': { id: 'AF', name: 'Ana Ferreira', role: 'Técnica', color: '#1F9D55' },
}

export const RESPONSAVEIS = ['Não atribuído', 'Carlos Dias', 'João Pedro', 'Ana Ferreira']

export const INITIAL_ORDERS = [
  { id: 'OS-2026-0138', title: 'Vazamento no ar-condicionado da sala 4B', priority: 'Alta', status: 'Aberta', responsavel: 'Não atribuído', avatar: '?', prazo: '12/09', abertaEm: '10/09/2026', concluidaEm: null, agingLabel: 'Aberta há 2 dias' },
  { id: 'OS-2026-0141', title: 'Substituir lâmpadas do corredor 2º andar', priority: 'Baixa', status: 'Aberta', responsavel: 'Ana Ferreira', avatar: 'AF', prazo: '20/09', abertaEm: '09/09/2026', concluidaEm: null, agingLabel: 'Aberta há 1 dia' },
  { id: 'OS-2026-0142', title: 'Porta de emergência com trava solta', priority: 'Média', status: 'Aberta', responsavel: 'Carlos Dias', avatar: 'CD', prazo: '11/09', abertaEm: '10/09/2026', concluidaEm: null, agingLabel: 'Aberta há 3 horas' },
  { id: 'OS-2026-0135', title: 'Manutenção preventiva no gerador principal', priority: 'Alta', status: 'Em andamento', responsavel: 'João Pedro', avatar: 'JP', prazo: '08/09', vencida: true, abertaEm: '06/09/2026', concluidaEm: null, agingLabel: 'Em andamento há 4 dias' },
  { id: 'OS-2026-0139', title: 'Ajuste no sistema de câmeras do estacionamento', priority: 'Média', status: 'Em andamento', responsavel: 'Ana Ferreira', avatar: 'AF', prazo: '15/09', abertaEm: '09/09/2026', concluidaEm: null, agingLabel: 'Em andamento há 1 dia' },
  { id: 'OS-2026-0130', title: 'Troca de filtro do sistema de climatização', priority: 'Baixa', status: 'Concluída', responsavel: 'Carlos Dias', avatar: 'CD', abertaEm: '03/09/2026', concluidaEm: '08/09/2026', agingLabel: 'Concluída em 08/09' },
  { id: 'OS-2026-0128', title: 'Reparo no sensor de presença da recepção', priority: 'Média', status: 'Concluída', responsavel: 'João Pedro', avatar: 'JP', abertaEm: '02/09/2026', concluidaEm: '05/09/2026', agingLabel: 'Concluída em 05/09' },
]

export const TOTAL_ORDERS_COUNT = 63
