import { Router } from 'express'
import ExcelJS from 'exceljs'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import {
  STATUS_DB_TO_API, STATUS_API_TO_DB,
  PRIORIDADE_DB_TO_API, PRIORIDADE_API_TO_DB,
} from '../lib/mapping.js'

const router = Router()
router.use(requireAuth)


function requireGestor(req, res, next) {
  if (!['ADMIN', 'GESTOR'].includes(req.user.perfil)) {
    return res.status(403).json({ erro: 'Você não tem permissão para exportar relatórios.' })
  }
  next()
}
router.use(requireGestor)

const FORMATOS = ['csv', 'xlsx']

const COLUNAS = [
  { header: 'Código', key: 'codigo', width: 16 },
  { header: 'Título', key: 'titulo', width: 40 },
  { header: 'Descrição', key: 'descricao', width: 50 },
  { header: 'Prioridade', key: 'prioridade', width: 12 },
  { header: 'Status', key: 'status', width: 16 },
  { header: 'Solicitante', key: 'solicitante', width: 24 },
  { header: 'Responsável', key: 'responsavel', width: 24 },
  { header: 'Data de abertura', key: 'dataAbertura', width: 16 },
  { header: 'Data de conclusão', key: 'dataConclusao', width: 18 },
  { header: 'Encerrado por', key: 'encerradoPor', width: 24 },
  { header: 'Solução', key: 'solucao', width: 50 },
]

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : ''
}

function linha(o) {
  return {
    codigo: o.codigo,
    titulo: o.titulo,
    descricao: o.descricao || '',
    prioridade: PRIORIDADE_DB_TO_API[o.prioridade] || '',
    status: STATUS_DB_TO_API[o.status] || o.status,
    solicitante: o.solicitante ? o.solicitante.nome : '',
    responsavel: o.responsavel ? o.responsavel.nome : 'Não atribuído',
    dataAbertura: fmtDate(o.dataAbertura),
    dataConclusao: fmtDate(o.dataConclusao),
    encerradoPor: o.encerradoPor ? o.encerradoPor.nome : '',
    solucao: o.solucao || '',
  }
}


function csvCell(valor) {
  let s = valor == null ? '' : String(valor)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  if (/[";\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`
  return s
}

function gerarCsv(linhas) {
  const cabecalho = COLUNAS.map((c) => csvCell(c.header)).join(';')
  const corpo = linhas.map((l) => COLUNAS.map((c) => csvCell(l[c.key])).join(';'))
  // BOM no início para o Excel reconhecer os acentos (UTF-8)
  return '\uFEFF' + [cabecalho, ...corpo].join('\r\n')
}

function parseData(valor, fimDoDia = false) {
  if (!valor) return null
  const d = new Date(`${valor}T${fimDoDia ? '23:59:59.999' : '00:00:00'}`)
  return Number.isNaN(d.getTime()) ? undefined : d
}


router.get('/ordens/exportar', asyncHandler(async (req, res) => {
  const { formato = 'csv', status, prioridade, de, ate } = req.query

  if (!FORMATOS.includes(formato)) {
    return res.status(400).json({ erro: 'Formato inválido. Use csv ou xlsx.' })
  }

  const where = {}

  if (status) {
    const statusDb = STATUS_API_TO_DB[status]
    if (!statusDb) return res.status(400).json({ erro: 'Status inválido.' })
    where.status = statusDb
  }

  if (prioridade) {
    const prioridadeDb = PRIORIDADE_API_TO_DB[prioridade]
    if (!prioridadeDb) return res.status(400).json({ erro: 'Prioridade inválida.' })
    where.prioridade = prioridadeDb
  }

  const dataDe = parseData(de)
  const dataAte = parseData(ate, true)
  if (dataDe === undefined || dataAte === undefined) {
    return res.status(400).json({ erro: 'Data inválida. Use o formato AAAA-MM-DD.' })
  }
  if (dataDe || dataAte) {
    where.createdAt = {}
    if (dataDe) where.createdAt.gte = dataDe
    if (dataAte) where.createdAt.lte = dataAte
  }

  const ordens = await prisma.ordemServico.findMany({
    where,
    include: { responsavel: true, solicitante: true, encerradoPor: true },
    orderBy: { createdAt: 'desc' },
  })
  const linhas = ordens.map(linha)

  await prisma.logAuditoria.create({
    data: {
      usuarioId: req.user.id,
      acao: 'exportar_relatorio',
      detalhes: { formato, total: linhas.length, filtros: { status, prioridade, de, ate } },
      ipOrigem: req.ip,
    },
  })

  const hoje = new Date().toISOString().slice(0, 10)
  const nomeArquivo = `ordens-servico-${hoje}.${formato}`

  if (formato === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`)
    return res.send(gerarCsv(linhas))
  }

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Altave'
  wb.created = new Date()
  const ws = wb.addWorksheet('Ordens de Serviço')
  ws.columns = COLUNAS
  ws.addRows(linhas)
  ws.getRow(1).font = { bold: true }
  ws.views = [{ state: 'frozen', ySplit: 1 }]
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUNAS.length } }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`)
  await wb.xlsx.write(res)
  res.end()
}))

export default router
