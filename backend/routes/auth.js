import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { PERFIL_LABEL, initials, colorFor } from '../lib/mapping.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, senha } = req.body || {}
  if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios.' })

  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario || !usuario.ativo) return res.status(401).json({ erro: 'Email ou senha inválidos.' })

  const ok = await bcrypt.compare(senha, usuario.senhaHash)
  if (!ok) return res.status(401).json({ erro: 'Email ou senha inválidos.' })

  const payload = { id: usuario.id, email: usuario.email, nome: usuario.nome, perfil: usuario.perfil }
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' })

  const user = {
    id: initials(usuario.nome),
    dbId: usuario.id,
    name: usuario.nome,
    email: usuario.email,
    role: PERFIL_LABEL[usuario.perfil] || usuario.perfil,
    perfil: usuario.perfil,
    color: colorFor(usuario.email),
  }

  res.json({ token, user })
})

export default router
