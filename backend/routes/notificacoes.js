import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireRoles } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { STATUS_DB_TO_API, tipoEvento } from '../lib/mapping.js'

const router = Router()
const LIMITE = 20
router.use(requireAuth, requireRoles('ADMIN', 'GESTOR'))

function toApi(evento, lida) {
  return {
    id: evento.id,
    codigo: evento.ordem.codigo,
    titulo: evento.ordem.titulo,
    tipo: tipoEvento(evento),
    de: STATUS_DB_TO_API[evento.statusAnterior] ?? null,
    para: STATUS_DB_TO_API[evento.statusNovo],
    quem: evento.usuario.nome,
    em: evento.createdAt,
    observacao: evento.observacao,
    lida,
  }
}

router.get('/', asyncHandler(async (req, res) => {
  const leitura = { usuarioId: req.user.id }
  const naoLidas = { leituras: { none: leitura } }
  const consulta = {
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: {
      ordem: { select: { codigo: true, titulo: true } },
      usuario: { select: { nome: true } },
    },
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const totalNaoLidas = await tx.historico.count({ where: naoLidas })
    const novas = await tx.historico.findMany({ ...consulta, where: naoLidas, take: LIMITE })
    const restantes = LIMITE - novas.length
    const lidas = restantes > 0
      ? await tx.historico.findMany({
        ...consulta, where: { leituras: { some: leitura } }, take: restantes,
      })
      : []

    return {
      totalNaoLidas,
      notificacoes: [...novas.map((evento) => toApi(evento, false)), ...lidas.map((evento) => toApi(evento, true))],
    }
  }, { isolationLevel: 'RepeatableRead' })
  res.json(resultado)
}))

router.post('/lidas', asyncHandler(async (req, res) => {
  const ids = req.body?.ids
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > LIMITE ||
      ids.some((id) => typeof id !== 'string' || id.length < 1 || id.length > 64)) {
    return res.status(400).json({ erro: 'Informe os IDs das notificações exibidas.' })
  }
  await prisma.$transaction(async (tx) => {
    const eventos = await tx.historico.findMany({ where: { id: { in: ids } }, select: { id: true } })
    if (eventos.length) {
      await tx.leituraNotificacao.createMany({
        data: eventos.map(({ id }) => ({ usuarioId: req.user.id, historicoId: id })),
        skipDuplicates: true,
      })
    }
  })
  res.sendStatus(204)
}))

export default router
