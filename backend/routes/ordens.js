import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import {
  STATUS_DB_TO_API, STATUS_API_TO_DB, STATUS_KANBAN_DB,
  PRIORIDADE_DB_TO_API, PRIORIDADE_API_TO_DB,
  initials, colorFor,
} from '../lib/mapping.js'

const router = Router()
router.use(requireAuth)

function fmtDate(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('pt-BR')
}

function agingLabel(o) {
  const base = o.dataAbertura ? new Date(o.dataAbertura) : new Date(o.createdAt)
  if (o.status === 'CONCLUIDA' && o.dataConclusao) {
    return `Concluída em ${fmtDate(o.dataConclusao).slice(0, 5)}`
  }
  const diffMs = Date.now() - base.getTime()
  const dias = Math.floor(diffMs / 86400000)
  const label = o.status === 'EM_ANDAMENTO' ? 'Em andamento' : 'Aberta'
  if (dias <= 0) {
    const horas = Math.max(1, Math.floor(diffMs / 3600000))
    return `${label} há ${horas} hora${horas === 1 ? '' : 's'}`
  }
  return `${label} há ${dias} dia${dias === 1 ? '' : 's'}`
}

function toApi(o) {
  return {
    id: o.codigo,
    title: o.titulo,
    descricao: o.descricao,
    priority: PRIORIDADE_DB_TO_API[o.prioridade] || 'Média',
    status: STATUS_DB_TO_API[o.status] || o.status,
    responsavel: o.responsavel ? o.responsavel.nome : 'Não atribuído',
    avatar: o.responsavel ? initials(o.responsavel.nome) : '?',
    avatarColor: o.responsavel ? colorFor(o.responsavel.email) : '#9aa4b2',
    abertaEm: fmtDate(o.dataAbertura),
    concluidaEm: fmtDate(o.dataConclusao),
    agingLabel: agingLabel(o),
  }
}

router.get('/', async (_req, res) => {
  const ordens = await prisma.ordemServico.findMany({
    where: { status: { in: STATUS_KANBAN_DB } },
    include: { responsavel: true, solicitante: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(ordens.map(toApi))
})

async function nextCodigo() {
  const ano = new Date().getFullYear()
  const ultima = await prisma.ordemServico.findFirst({
    where: { codigo: { startsWith: `OS-${ano}-` } },
    orderBy: { codigo: 'desc' },
  })
  const seq = ultima ? parseInt(ultima.codigo.split('-')[2], 10) + 1 : 1
  return `OS-${ano}-${String(seq).padStart(4, '0')}`
}

router.post('/', async (req, res) => {
  const { titulo, descricao, prioridade, responsavel } = req.body || {}
  if (!titulo) return res.status(400).json({ erro: 'Título é obrigatório.' })

  let responsavelId = null
  if (responsavel && responsavel !== 'Não atribuído') {
    const resp = await prisma.usuario.findFirst({ where: { nome: responsavel } })
    responsavelId = resp ? resp.id : null
  }

  const codigo = await nextCodigo()
  const ordem = await prisma.ordemServico.create({
    data: {
      codigo,
      titulo,
      descricao: descricao || '',
      prioridade: PRIORIDADE_API_TO_DB[prioridade] || 'MEDIA',
      status: 'ABERTA',
      dataAbertura: new Date(),
      solicitanteId: req.user.id,
      responsavelId,
      historicos: { create: { usuarioId: req.user.id, statusAnterior: null, statusNovo: 'ABERTA' } },
    },
    include: { responsavel: true, solicitante: true },
  })

  res.status(201).json(toApi(ordem))
})

router.patch('/:codigo/status', async (req, res) => {
  const { status } = req.body || {}
  const statusDb = STATUS_API_TO_DB[status]
  if (!statusDb) return res.status(400).json({ erro: 'Status inválido.' })

  const atual = await prisma.ordemServico.findUnique({ where: { codigo: req.params.codigo } })
  if (!atual) return res.status(404).json({ erro: 'Ordem não encontrada.' })

  const ordem = await prisma.ordemServico.update({
    where: { codigo: req.params.codigo },
    data: {
      status: statusDb,
      dataConclusao: statusDb === 'CONCLUIDA' ? new Date() : null,
      historicos: { create: { usuarioId: req.user.id, statusAnterior: atual.status, statusNovo: statusDb } },
    },
    include: { responsavel: true, solicitante: true },
  })

  res.json(toApi(ordem))
})

export default router
