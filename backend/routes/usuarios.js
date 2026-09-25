import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
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

// só Gestor/Administrador podem cadastrar/gerenciar usuários
function requireGestor(req, res, next) {
  if (!['ADMIN', 'GESTOR'].includes(req.user.perfil)) {
    return res.status(403).json({ erro: 'Você não tem permissão para gerenciar usuários.' })
  }
  next()
}

// GET /api/usuarios
router.get('/', async (_req, res) => {
  const usuarios = await prisma.usuario.findMany({ orderBy: { nome: 'asc' } })
  res.json(usuarios.map(toApi))
})

// POST /api/usuarios
router.post('/', requireGestor, async (req, res) => {
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
})

// PATCH /api/usuarios/:id/ativo  { ativo: boolean }  — desativar em vez de excluir
router.patch('/:id/ativo', requireGestor, async (req, res) => {
  const { ativo } = req.body || {}
  const user = await prisma.usuario.update({ where: { id: req.params.id }, data: { ativo: Boolean(ativo) } })
  res.json(toApi(user))
})

export default router
