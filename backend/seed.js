// Popula o banco com usuários de teste e algumas ordens de serviço.
// Rode depois do prisma migrate/db push: npm run seed
import bcrypt from 'bcryptjs'
import { prisma } from './lib/prisma.js'

const USERS = [
  { email: 'carlos.dias@altave.com', nome: 'Carlos Dias', senha: '12345678', perfil: 'GESTOR' },
  { email: 'joao.pedro@altave.com', nome: 'João Pedro', senha: '12345678', perfil: 'EXECUTOR' },
  { email: 'ana.ferreira@altave.com', nome: 'Ana Ferreira', senha: '12345678', perfil: 'EXECUTOR' },
]

const ORDENS = [
  { codigo: 'OS-2026-0138', titulo: 'Vazamento no ar-condicionado da sala 4B', descricao: 'Vazamento visível próximo à unidade evaporadora.', prioridade: 'ALTA', status: 'ABERTA', responsavel: null },
  { codigo: 'OS-2026-0141', titulo: 'Substituir lâmpadas do corredor 2º andar', descricao: 'Duas lâmpadas queimadas.', prioridade: 'BAIXA', status: 'ABERTA', responsavel: 'ana.ferreira@altave.com' },
  { codigo: 'OS-2026-0142', titulo: 'Porta de emergência com trava solta', descricao: 'Trava não engata corretamente.', prioridade: 'MEDIA', status: 'ABERTA', responsavel: 'carlos.dias@altave.com' },
  { codigo: 'OS-2026-0135', titulo: 'Manutenção preventiva no gerador principal', descricao: 'Revisão programada trimestral.', prioridade: 'ALTA', status: 'EM_ANDAMENTO', responsavel: 'joao.pedro@altave.com' },
  { codigo: 'OS-2026-0139', titulo: 'Ajuste no sistema de câmeras do estacionamento', descricao: 'Câmera 3 com foco desregulado.', prioridade: 'MEDIA', status: 'EM_ANDAMENTO', responsavel: 'ana.ferreira@altave.com' },
  { codigo: 'OS-2026-0130', titulo: 'Troca de filtro do sistema de climatização', descricao: 'Troca de rotina.', prioridade: 'BAIXA', status: 'CONCLUIDA', responsavel: 'carlos.dias@altave.com' },
  { codigo: 'OS-2026-0128', titulo: 'Reparo no sensor de presença da recepção', descricao: 'Sensor não detecta movimento.', prioridade: 'MEDIA', status: 'CONCLUIDA', responsavel: 'joao.pedro@altave.com' },
]

async function run() {
  const ids = {}
  for (const u of USERS) {
    const senhaHash = await bcrypt.hash(u.senha, 10)
    const user = await prisma.usuario.upsert({
      where: { email: u.email },
      update: { nome: u.nome, perfil: u.perfil },
      create: { email: u.email, nome: u.nome, senhaHash, perfil: u.perfil },
    })
    ids[u.email] = user.id
  }

  const solicitante = ids['carlos.dias@altave.com']
  for (const o of ORDENS) {
    const concluida = o.status === 'CONCLUIDA'
    const existente = await prisma.ordemServico.findUnique({ where: { codigo: o.codigo } })
    if (existente) continue
    await prisma.ordemServico.create({
      data: {
        codigo: o.codigo,
        titulo: o.titulo,
        descricao: o.descricao,
        prioridade: o.prioridade,
        status: o.status,
        dataAbertura: new Date(),
        dataConclusao: concluida ? new Date() : null,
        solicitanteId: solicitante,
        responsavelId: o.responsavel ? ids[o.responsavel] : null,
        historicos: { create: { usuarioId: solicitante, statusAnterior: null, statusNovo: o.status } },
      },
    })
  }

  console.log('Seed concluído. Login de teste (senha "12345678"):', Object.keys(ids).join(', '))
}

run()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
