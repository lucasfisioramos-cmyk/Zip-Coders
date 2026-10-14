import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import {
  STATUS_DB_TO_API, STATUS_API_TO_DB, STATUS_KANBAN_DB,
  PRIORIDADE_DB_TO_API, PRIORIDADE_API_TO_DB,
  initials, colorFor,
} from '../lib/mapping.js'

const router = Router()
router.use(requireAuth)

const INCLUDE_OS = { responsavel: true, solicitante: true, encerradoPor: true }

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

// Só Gestor/Administrador ou o responsável pela OS podem encerrá-la.
// Reabrir uma OS concluída é exclusivo de Gestor/Administrador.
const isGestor = (user) => ['ADMIN', 'GESTOR'].includes(user.perfil)
const EM_ABERTO = ['ABERTA', 'EM_ANDAMENTO']

function podeEncerrar(user, o) {
  return EM_ABERTO.includes(o.status) && (isGestor(user) || o.responsavelId === user.id)
}
function podeReabrir(user, o) {
  return o.status === 'CONCLUIDA' && isGestor(user)
}

function toApi(o, user) {
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
    encerradoPor: o.encerradoPor ? o.encerradoPor.nome : null,
    solicitante: o.solicitante ? o.solicitante.nome : null,
    agingLabel: agingLabel(o),
    solucao: o.solucao,
    podeEncerrar: podeEncerrar(user, o),
    podeReabrir: podeReabrir(user, o),
  }
}

router.get('/', asyncHandler(async (req, res) => {
  const ordens = await prisma.ordemServico.findMany({
    where: { status: { in: STATUS_KANBAN_DB } },
    include: INCLUDE_OS,
    orderBy: { createdAt: 'desc' },
  })
  res.json(ordens.map((o) => toApi(o, req.user)))
}))

async function nextCodigo() {
  const ano = new Date().getFullYear()
  const ultima = await prisma.ordemServico.findFirst({
    where: { codigo: { startsWith: `OS-${ano}-` } },
    orderBy: { codigo: 'desc' },
  })
  const seq = ultima ? parseInt(ultima.codigo.split('-')[2], 10) + 1 : 1
  return `OS-${ano}-${String(seq).padStart(4, '0')}`
}

router.post('/', asyncHandler(async (req, res) => {
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
    include: INCLUDE_OS,
  })

  await prisma.logAuditoria.create({
    data: { usuarioId: req.user.id, acao: 'criar_os', detalhes: { codigo }, ipOrigem: req.ip },
  })

  res.status(201).json(toApi(ordem, req.user))
}))

// GET /api/ordens/:codigo/historico
// Linha do tempo da OS (mais antiga primeiro): criação, mudanças de status, encerramento e reabertura.
// Qualquer usuário autenticado pode consultar, assim como já pode ver a OS no quadro.
function tipoEvento(h) {
  if (!h.statusAnterior) return 'criacao'
  if (h.statusNovo === 'CONCLUIDA') return 'encerramento'
  if (h.statusAnterior === 'CONCLUIDA') return 'reabertura'
  return 'mudanca'
}

router.get('/:codigo/historico', asyncHandler(async (req, res) => {
  const ordem = await prisma.ordemServico.findUnique({
    where: { codigo: req.params.codigo },
    include: { historicos: { include: { usuario: true }, orderBy: { createdAt: 'asc' } } },
  })
  if (!ordem) return res.status(404).json({ erro: 'Ordem não encontrada.' })

  res.json({
    codigo: ordem.codigo,
    titulo: ordem.titulo,
    eventos: ordem.historicos.map((h) => ({
      id: h.id,
      tipo: tipoEvento(h),
      de: h.statusAnterior ? STATUS_DB_TO_API[h.statusAnterior] || h.statusAnterior : null,
      para: STATUS_DB_TO_API[h.statusNovo] || h.statusNovo,
      quem: h.usuario.nome,
      avatar: initials(h.usuario.nome),
      avatarColor: colorFor(h.usuario.email),
      em: h.createdAt, // ISO; o front formata no fuso do navegador
      observacao: h.observacao,
    })),
  })
}))

router.patch('/:codigo/status', asyncHandler(async (req, res) => {
  const { status } = req.body || {}
  const statusDb = STATUS_API_TO_DB[status]
  if (!statusDb) return res.status(400).json({ erro: 'Status inválido.' })
  if (statusDb === 'CONCLUIDA') {
    return res.status(400).json({ erro: 'Para concluir uma ordem use o encerramento (POST /ordens/:codigo/encerrar).' })
  }

  const atual = await prisma.ordemServico.findUnique({ where: { codigo: req.params.codigo } })
  if (!atual) return res.status(404).json({ erro: 'Ordem não encontrada.' })

  // soltar o card na mesma coluna não é uma mudança
  if (atual.status === statusDb) {
    const igual = await prisma.ordemServico.findUnique({
      where: { codigo: atual.codigo }, include: INCLUDE_OS,
    })
    return res.json(toApi(igual, req.user))
  }

  const reabrindo = atual.status === 'CONCLUIDA'
  if (reabrindo && !podeReabrir(req.user, atual)) {
    return res.status(403).json({ erro: 'Somente Gestor ou Administrador pode reabrir uma ordem concluída.' })
  }

  const [ordem] = await prisma.$transaction([
    prisma.ordemServico.update({
      where: { codigo: atual.codigo },
      data: {
        status: statusDb,
        dataConclusao: null,
        encerradoPorId: null,
        historicos: { create: { usuarioId: req.user.id, statusAnterior: atual.status, statusNovo: statusDb } },
      },
      include: INCLUDE_OS,
    }),
    prisma.logAuditoria.create({
      data: {
        usuarioId: req.user.id,
        acao: reabrindo ? 'reabrir_os' : 'mudar_status',
        detalhes: { codigo: atual.codigo, de: atual.status, para: statusDb },
        ipOrigem: req.ip,
      },
    }),
  ])

  res.json(toApi(ordem, req.user))
}))

// POST /api/ordens/:codigo/encerrar  { solucao }
// Único caminho para concluir uma OS: exige a descrição da solução aplicada.
router.post('/:codigo/encerrar', asyncHandler(async (req, res) => {
  const solucao = typeof req.body?.solucao === 'string' ? req.body.solucao.trim() : ''
  if (solucao.length < 10) {
    return res.status(400).json({ erro: 'Descreva a solução aplicada (mínimo de 10 caracteres).' })
  }
  if (solucao.length > 5000) {
    return res.status(400).json({ erro: 'A descrição da solução é longa demais (máximo de 5000 caracteres).' })
  }

  const atual = await prisma.ordemServico.findUnique({ where: { codigo: req.params.codigo } })
  if (!atual) return res.status(404).json({ erro: 'Ordem não encontrada.' })
  if (atual.status === 'CONCLUIDA') return res.status(409).json({ erro: 'Esta ordem já foi encerrada.' })
  if (!EM_ABERTO.includes(atual.status)) {
    return res.status(409).json({ erro: 'Somente ordens abertas ou em andamento podem ser encerradas.' })
  }
  if (!podeEncerrar(req.user, atual)) {
    return res.status(403).json({ erro: 'Somente o responsável pela ordem, um Gestor ou um Administrador pode encerrá-la.' })
  }

  const [ordem] = await prisma.$transaction([
    prisma.ordemServico.update({
      where: { codigo: atual.codigo },
      data: {
        status: 'CONCLUIDA',
        dataConclusao: new Date(),
        encerradoPorId: req.user.id,
        solucao,
        historicos: {
          create: { usuarioId: req.user.id, statusAnterior: atual.status, statusNovo: 'CONCLUIDA', observacao: solucao },
        },
      },
      include: INCLUDE_OS,
    }),
    prisma.logAuditoria.create({
      data: {
        usuarioId: req.user.id,
        acao: 'encerrar_os',
        detalhes: { codigo: atual.codigo, de: atual.status },
        ipOrigem: req.ip,
      },
    }),
  ])

  res.json(toApi(ordem, req.user))
}))

export default router
