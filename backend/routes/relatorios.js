import { Router } from 'express'
import { requireAuth, requireRoles } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import {
  gerarCsvOrdens,
  gerarXlsxOrdens,
  FiltroInvalidoError,
} from '../services/relatorios.service.js'

const router = Router()
router.use(requireAuth, requireRoles('ADMIN', 'GESTOR'))

const texto = (v) => (typeof v === 'string' ? v : undefined)

// GET /api/relatorios/ordens/exportar?formato=csv|xlsx&status=&responsavel=&periodo=
router.get('/ordens/exportar', asyncHandler(async (req, res) => {
  const filtros = {
    status: texto(req.query.status),
    responsavel: texto(req.query.responsavel),
    periodo: texto(req.query.periodo),
  }
  const formato = req.query.formato === 'xlsx' ? 'xlsx' : 'csv'
  const dia = new Date().toLocaleDateString('sv-SE') // aaaa-mm-dd

  try {
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