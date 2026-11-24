import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { requireAuth, requireRoles } from '../middleware/auth.js'
import { PERFIL_LABEL, initials, colorFor } from '../lib/mapping.js'

const router = Router()
router.use(requireAuth)

function podeAtribuirPerfil(ator, perfil) {
  return ator.perfil === 'ADMIN' || perfil !== 'ADMIN'
}

function podeGerenciarMembro(ator, membro) {
  return ator.perfil === 'ADMIN' ||
    (ator.perfil === 'GESTOR' && membro.id !== ator.id && membro.perfil !== 'ADMIN')
}

function toApi(u, ator) {
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
    podeGerenciar: podeGerenciarMembro(ator, u),
  }
}

const requireGestor = requireRoles('ADMIN', 'GESTOR')

// GET /api/usuarios
router.get('/', asyncHandler(async (req, res) => {
  const usuarios = await prisma.usuario.findMany({ orderBy: { nome: 'asc' } })
  res.json(usuarios.map((usuario) => toApi(usuario, req.user)))
}))

router.get('/perfis', requireGestor, (req, res) => {
  res.json(Object.entries(PERFIL_LABEL)
    .filter(([perfil]) => podeAtribuirPerfil(req.user, perfil))
    .map(([value, label]) => ({ value, label })))
})

const acessoNegado = (res) => res.status(403).json({ erro: 'Acesso não autorizado' })
const perfilValido = (perfil) => typeof perfil === 'string' && Object.hasOwn(PERFIL_LABEL, perfil)

router.post('/', requireGestor, asyncHandler(async (req, res) => {
  const { nome, email, senha, perfil } = req.body || {}
  if (!perfilValido(perfil)) return res.status(400).json({ erro: 'Perfil inválido.' })
  if (!podeAtribuirPerfil(req.user, perfil)) return acessoNegado(res)
  if (![nome, email, senha].every((valor) => typeof valor === 'string' && valor.trim())) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' })
  }
  if (nome.trim().length > 100 || email.trim().length > 100) {
    return res.status(400).json({ erro: 'Nome e email devem ter no máximo 100 caracteres.' })
  }
  if (senha.length < 8) return res.status(400).json({ erro: 'A senha precisa ter pelo menos 8 caracteres.' })

  const senhaHash = await bcrypt.hash(senha, 10)
  try {
    const [usuario] = await prisma.$transaction([
      prisma.usuario.create({ data: { nome: nome.trim(), email: email.trim(), senhaHash, perfil } }),
      prisma.logAuditoria.create({
        data: { usuarioId: req.user.id, acao: 'criar_usuario', detalhes: { email: email.trim() }, ipOrigem: req.ip },
      }),
    ])
    res.status(201).json(toApi(usuario, req.user))
  } catch (erro) {
    if (erro.code === 'P2002') return res.status(409).json({ erro: 'Já existe um usuário com esse email.' })
    throw erro
  }
}))

async function atualizarMembro(req, res, campo, valor, acao) {
  const atual = await prisma.usuario.findUnique({ where: { id: req.params.id } })
  if (!atual) return res.status(404).json({ erro: 'Usuário não encontrado.' })
  if (!podeGerenciarMembro(req.user, atual)) return acessoNegado(res)
  if (atual[campo] === valor) return res.json(toApi(atual, req.user))

  try {
    const [usuario] = await prisma.$transaction([
      prisma.usuario.update({
        where: {
          id: atual.id,
          perfil: atual.perfil,
          ...(campo === 'ativo' && { ativo: atual.ativo }),
        },
        data: { [campo]: valor },
      }),
      prisma.logAuditoria.create({ data: {
        usuarioId: req.user.id, acao, ipOrigem: req.ip,
        detalhes: { usuarioId: atual.id, de: atual[campo], para: valor },
      } }),
    ])
    res.json(toApi(usuario, req.user))
  } catch (erro) {
    if (erro.code === 'P2025') return res.status(409).json({ erro: 'O usuário foi alterado. Recarregue a lista.' })
    throw erro
  }
}

router.patch('/:id/ativo', requireGestor, asyncHandler(async (req, res) => {
  const ativo = req.body?.ativo
  if (typeof ativo !== 'boolean') return res.status(400).json({ erro: 'Informe se o usuário deve ficar ativo.' })
  return atualizarMembro(req, res, 'ativo', ativo, ativo ? 'ativar_usuario' : 'desativar_usuario')
}))

router.patch('/:id/perfil', requireGestor, asyncHandler(async (req, res) => {
  const perfil = req.body?.perfil
  if (!perfilValido(perfil)) return res.status(400).json({ erro: 'Perfil inválido.' })
  if (!podeAtribuirPerfil(req.user, perfil)) return acessoNegado(res)
  return atualizarMembro(req, res, 'perfil', perfil, 'alterar_perfil')
}))

export default router
