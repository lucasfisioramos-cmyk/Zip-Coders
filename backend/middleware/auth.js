import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

// O token identifica a sessão; o banco é a fonte atual de permissões.
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ erro: 'Token não informado.' })
  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
    if (typeof payload.id !== 'string') throw new Error('Identidade inválida')
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' })
  }
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: payload.id } })
    if (!usuario?.ativo) return res.status(401).json({ erro: 'Sessão inválida.' })
    req.user = { id: usuario.id, email: usuario.email, nome: usuario.nome, perfil: usuario.perfil }
    res.set('X-User-Perfil', usuario.perfil)
    next()
  } catch (err) { next(err) }
}

export function requireRoles(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.user?.perfil)) {
      return res.status(403).json({ erro: 'Acesso não autorizado' })
    }
    next()
  }
}
