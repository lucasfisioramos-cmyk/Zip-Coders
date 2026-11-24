import { requireAuth, requireRoles } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { PERFIL_LABEL, initials, colorFor } from '../lib/mapping.js'

const router = Router()

function usuarioLogado(usuario) {
  return {
    id: initials(usuario.nome),
    dbId: usuario.id,
    name: usuario.nome,
    email: usuario.email,
    role: PERFIL_LABEL[usuario.perfil] || usuario.perfil,
    perfil: usuario.perfil,
    color: colorFor(usuario.email),
  }
}

function sessao(usuario) {
  return {
    user: {
      ...usuarioLogado(usuario),
      permissoes: { relatorios: ['ADMIN', 'GESTOR'].includes(usuario.perfil) },
    },
  }
}

router.post('/login', asyncHandler(async (req, res) => {
  const { email, senha } = req.body || {}
  if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios.' })

  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario || !usuario.ativo) return res.status(401).json({ erro: 'Email ou senha inválidos.' })

  const ok = await bcrypt.compare(senha, usuario.senhaHash)
  if (!ok) return res.status(401).json({ erro: 'Email ou senha inválidos.' })

  const payload = { id: usuario.id, email: usuario.email, nome: usuario.nome, perfil: usuario.perfil }
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' })

  res.json({ token, user: usuarioLogado(usuario) })
}))

router.get('/me', requireAuth, (req, res) => {
  res.json(sessao(req.user))
})

router.patch('/me', requireAuth, requireRoles('EXECUTOR', 'GESTOR'), asyncHandler(async (req, res) => {
  const nome = typeof req.body?.nome === 'string' ? req.body.nome.trim() : ''
  if (!nome || nome.length > 100) {
    return res.status(400).json({ erro: 'Informe um nome de até 100 caracteres.' })
  }
  const atual = req.user
  if (nome === atual.nome) return res.json(sessao(atual))

  try {
    const [usuario] = await prisma.$transaction([
      prisma.usuario.update({
        where: { id: atual.id, perfil: atual.perfil, ativo: true, nome: atual.nome },
        data: { nome },
      }),
      prisma.logAuditoria.create({ data: {
        usuarioId: atual.id, acao: 'alterar_proprio_nome', ipOrigem: req.ip,
        detalhes: { de: atual.nome, para: nome },
      } }),
    ])
    res.json(sessao(usuario))
  } catch (erro) {
    if (erro.code === 'P2025') {
      return res.status(409).json({ erro: 'Seu perfil mudou. Recarregue a página e tente novamente.' })
    }
    throw erro
  }
}))

export default router
