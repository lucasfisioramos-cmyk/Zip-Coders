import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { enviarEmail } from '../lib/email.js'
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

// Só Gestor/Administrador define ou muda a prioridade, e só enquanto a OS não está concluída.
function podeAlterarPrioridade(user, o) {
  return o.status !== 'CONCLUIDA' && isGestor(user)
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
    podeAlterarPrioridade: podeAlterarPrioridade(user, o),
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
  const prioridadeDb = PRIORIDADE_API_TO_DB[prioridade]
  if (!prioridadeDb) {
    return res.status(400).json({ erro: 'Prioridade é obrigatória (Baixa, Média, Alta ou Urgente).' })
  }

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
      prioridade: prioridadeDb,
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
  if (h.statusAnterior === h.statusNovo) return 'edicao' // edição de campos: status não muda
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

// PATCH /api/ordens/:codigo  { titulo?, descricao?, prioridade?, responsavel?, motivo }
// Edita campos da OS. `motivo` é obrigatório: vai para o histórico e para o e-mail dos envolvidos.
router.patch('/:codigo', asyncHandler(async (req, res) => {
  const { titulo, descricao, prioridade, responsavel } = req.body || {}
  const motivo = typeof req.body?.motivo === 'string' ? req.body.motivo.trim() : ''
  if (motivo.length < 5) return res.status(400).json({ erro: 'Informe a breve descrição da alteração (mínimo de 5 caracteres).' })
  if (motivo.length > 1000) return res.status(400).json({ erro: 'A descrição da alteração é longa demais (máximo de 1000 caracteres).' })
  if (titulo !== undefined && (!String(titulo).trim() || String(titulo).length > 150)) {
    return res.status(400).json({ erro: 'Título é obrigatório (máximo de 150 caracteres).' })
  }
  if (prioridade !== undefined && !PRIORIDADE_API_TO_DB[prioridade]) return res.status(400).json({ erro: 'Prioridade inválida.' })

  const atual = await prisma.ordemServico.findUnique({
    where: { codigo: req.params.codigo },
    include: { responsavel: true, historicos: { select: { usuarioId: true } } },
  })
  if (!atual) return res.status(404).json({ erro: 'Ordem não encontrada.' })
  if (!podeEditar(req.user, atual)) {
    return res.status(403).json({ erro: 'Você não pode editar esta ordem (ou ela já foi concluída).' })
  }

  // novoResp: undefined = não mexe; null = sem responsável; objeto = novo responsável
  let novoResp
  if (responsavel !== undefined) {
    novoResp = responsavel === 'Não atribuído' ? null : await prisma.usuario.findFirst({ where: { nome: responsavel, ativo: true } })
    if (novoResp === null && responsavel !== 'Não atribuído') return res.status(400).json({ erro: 'Responsável não encontrado.' })
  }

  // Diff: só entra o que de fato mudou. Prioridade compara pelo rótulo da API (URGENTE aparece como "Alta").
  const data = {}
  const mudancas = []
  const muda = (campo, de, para) => mudancas.push(`${campo}: "${de || '—'}" → "${para || '—'}"`)
  if (titulo !== undefined && titulo.trim() !== atual.titulo) { data.titulo = titulo.trim(); muda('Título', atual.titulo, data.titulo) }
  if (descricao !== undefined && descricao !== atual.descricao) { data.descricao = descricao; muda('Descrição', atual.descricao, descricao) }
  const prioAtual = PRIORIDADE_DB_TO_API[atual.prioridade]
  if (prioridade !== undefined && prioridade !== prioAtual) { data.prioridade = PRIORIDADE_API_TO_DB[prioridade]; muda('Prioridade', prioAtual, prioridade) }
  if (novoResp !== undefined && (novoResp?.id ?? null) !== atual.responsavelId) {
    data.responsavelId = novoResp?.id ?? null
    muda('Responsável', atual.responsavel?.nome || 'Não atribuído', novoResp?.nome || 'Não atribuído')
  }
  if (!mudancas.length) return res.status(400).json({ erro: 'Nenhuma alteração para salvar.' })

  const resumo = mudancas.join('\n')
  const [ordem] = await prisma.$transaction([
    prisma.ordemServico.update({
      where: { codigo: atual.codigo },
      data: {
        ...data,
        // status igual nos dois lados = evento de edição na linha do tempo
        historicos: { create: { usuarioId: req.user.id, statusAnterior: atual.status, statusNovo: atual.status, observacao: `${resumo}\nMotivo: ${motivo}` } },
      },
      include: INCLUDE_OS,
    }),
    prisma.logAuditoria.create({
      data: { usuarioId: req.user.id, acao: 'editar_os', detalhes: { codigo: atual.codigo, mudancas, motivo }, ipOrigem: req.ip },
    }),
  ])

  // Envolvidos: solicitante, responsável (antigo e novo) e quem já aparece no histórico. O autor não recebe.
  const ids = new Set([atual.solicitanteId, atual.responsavelId, ordem.responsavelId, ...atual.historicos.map((h) => h.usuarioId)])
  ids.delete(null)
  ids.delete(req.user.id)
  // E-mail depois do commit e sem await da resposta: falha de SMTP não desfaz a edição.
  prisma.usuario.findMany({ where: { id: { in: [...ids] }, ativo: true }, select: { email: true } })
    .then((us) => enviarEmail({
      to: us.map((u) => u.email),
      subject: `[Altave] ${atual.codigo} foi alterada`,
      text: `A ordem ${atual.codigo} (${ordem.titulo}) foi alterada por ${req.user.nome}.\n\nO que mudou:\n${resumo}\n\nMotivo: ${motivo}`,
    }))
    .catch((err) => console.error(`Falha ao enviar e-mail da ${atual.codigo}:`, err.message))

  res.json(toApi(ordem, req.user))
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

// PATCH /api/ordens/:codigo/prioridade  { prioridade }
// Gestor/Administrador muda a prioridade. Fica registrado na linha do tempo (EventoOS) e na auditoria.
router.patch('/:codigo/prioridade', asyncHandler(async (req, res) => {
  const prioridadeDb = PRIORIDADE_API_TO_DB[req.body?.prioridade]
  if (!prioridadeDb) {
    return res.status(400).json({ erro: 'Prioridade inválida (Baixa, Média, Alta ou Urgente).' })
  }

  const atual = await prisma.ordemServico.findUnique({ where: { codigo: req.params.codigo } })
  if (!atual) return res.status(404).json({ erro: 'Ordem não encontrada.' })
  if (!isGestor(req.user)) {
    return res.status(403).json({ erro: 'Somente Gestor ou Administrador pode alterar a prioridade.' })
  }
  if (atual.status === 'CONCLUIDA') {
    return res.status(409).json({ erro: 'Não é possível alterar a prioridade de uma ordem concluída.' })
  }

  if (atual.prioridade === prioridadeDb) {
    const igual = await prisma.ordemServico.findUnique({ where: { codigo: atual.codigo }, include: INCLUDE_OS })
    return res.json(toApi(igual, req.user))
  }

  const de = PRIORIDADE_DB_TO_API[atual.prioridade] || null
  const para = PRIORIDADE_DB_TO_API[prioridadeDb]
  const [ordem] = await prisma.$transaction([
    prisma.ordemServico.update({
      where: { codigo: atual.codigo },
      data: {
        prioridade: prioridadeDb,
        eventos: {
          create: {
            usuarioId: req.user.id,
            tipo: 'CAMPO_ALTERADO',
            mensagem: `Prioridade alterada de ${de || 'não definida'} para ${para}`,
            detalhes: { campo: 'prioridade', de: atual.prioridade, para: prioridadeDb },
          },
        },
      },
      include: INCLUDE_OS,
    }),
    prisma.logAuditoria.create({
      data: {
        usuarioId: req.user.id,
        acao: 'mudar_prioridade',
        detalhes: { codigo: atual.codigo, de: atual.prioridade, para: prioridadeDb },
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
