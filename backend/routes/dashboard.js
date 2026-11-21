import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { totaisPorStatus } from '../services/dashboard.service.js'

const router = Router()
router.use(requireAuth)

const isGestor = (user) => ['ADMIN', 'GESTOR'].includes(user.perfil)

// GET /api/dashboard/status
router.get('/status', asyncHandler(async (req, res) => {
  if (!isGestor(req.user)) {
    return res.status(403).json({ erro: 'Somente Gestor ou Administrador pode ver o painel.' })
  }
  res.json(await totaisPorStatus())
}))

export default router