import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { requireAuth, requireRoles } from '../middleware/auth.js'
import { PERFIL_LABEL, initials, colorFor } from '../lib/mapping.js'

const router = Router()
router.use(requireAuth)

function toApi(u) {
  return {
    id: u.id,
    name: u.nome,
    email: u.email,
    role: PERFIL_LABEL[u.perfil] || u.perfil,
    perfil: u.perfil,
    ativo: u.ativo,
    avatar: initials(u.nome),
    avatarColor: colorFor(u.email),
    criadoEm: u.createdAt,
  }
}

const requireAdmin = requireRoles('ADMIN')
const requireGestor = requireRoles('ADMIN', 'GESTOR')

// GET /api/usuarios
router.get('/', asyncHandler(async (_req, res) => {
  const usuarios = await prisma.usuario.findMany({ orderBy: { nome: 'asc' } })
  res.json(usuarios.map(toApi))
}))

// POST /api/usuarios
router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const { nome, email, senha, perfil } = req.body || {}
  if (!nome || !email || !senha) return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' })
  if (senha.length < 8) return res.status(400).json({ erro: 'A senha precisa ter pelo menos 8 caracteres.' })
  if (!['ADMIN', 'GESTOR', 'EXECUTOR', 'USUARIO'].includes(perfil)) {
    return res.status(400).json({ erro: 'Perfil inválido.' })
  }

  const existente = await prisma.usuario.findUnique({ where: { email } })
  if (existente) return res.status(409).json({ erro: 'Já existe um usuário com esse email.' })

  const senhaHash = await bcrypt.hash(senha, 10)
  const user = await prisma.usuario.create({ data: { nome, email, senhaHash, perfil } })

  await prisma.logAuditoria.create({
    data: { usuarioId: req.user.id, acao: 'criar_usuario', detalhes: { email }, ipOrigem: req.ip },
  })

  res.status(201).json(toApi(user))
}))

// PATCH /api/usuarios/:id/ativo  { ativo: boolean }  — desativar em vez de excluir
router.patch('/:id/ativo', requireGestor, asyncHandler(async (req, res) => {
  const { ativo } = req.body || {}
  const user = await prisma.usuario.update({ where: { id: req.params.id }, data: { ativo: Boolean(ativo) } })
  res.json(toApi(user))
}))

// Alteração e auditoria são confirmadas juntas antes de responder.
router.patch('/:id/perfil', requireAdmin, asyncHandler(async (req, res) => {
  const perfil = req.body?.perfil
  if (typeof perfil !== 'string' || !Object.hasOwn(PERFIL_LABEL, perfil)) return res.status(400).json({ erro: 'Perfil inválido.' })
  const user = await prisma.$transaction(async (tx) => {
    const atual = await tx.usuario.findUnique({ where: { id: req.params.id } })
    if (!atual) return null
    const atualizado = await tx.usuario.update({ where: { id: atual.id }, data: { perfil } })
    await tx.logAuditoria.create({ data: {
      usuarioId: req.user.id, acao: 'alterar_perfil', ipOrigem: req.ip,
      detalhes: { usuarioId: atual.id, de: atual.perfil, para: perfil },
    } })
    return atualizado
  })
  if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' })
  res.json(toApi(user))
}))

export default router
