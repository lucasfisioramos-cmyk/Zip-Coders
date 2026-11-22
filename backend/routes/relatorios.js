import { Router } from 'express'
import { requireAuth, requireRoles } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import {
  gerarCsvOrdens,
  gerarXlsxOrdens,
} from '../services/relatorios.service.js'
import { FiltroInvalidoError, lerFiltros } from '../lib/filtros-ordens.js'

const router = Router()
router.use(requireAuth, requireRoles('ADMIN', 'GESTOR'))

// GET /api/relatorios/ordens/exportar
router.get('/ordens/exportar', asyncHandler(async (req, res) => {
  const formato = req.query.formato === 'xlsx' ? 'xlsx' : 'csv'
  const dia = new Date().toLocaleDateString('sv-SE') // aaaa-mm-dd

  try {
    const filtros = lerFiltros(req.query)
    if (formato === 'xlsx') {
      const buffer = await gerarXlsxOrdens(filtros)
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      res.setHeader('Content-Disposition', `attachment; filename="ordens-${dia}.xlsx"`)
      return res.send(buffer)
    }

    const csv = await gerarCsvOrdens(filtros)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="ordens-${dia}.csv"`)
    res.send(csv)
  } catch (e) {
    if (e instanceof FiltroInvalidoError) return res.status(400).json({ erro: e.message })
    throw e
  }
}))

export default router