import ExcelJS from 'exceljs'
import { prisma } from '../lib/prisma.js'
import { FUSO_ORDENS, montarWhere } from '../lib/filtros-ordens.js'

const COLUNAS = ['ID', 'Título', 'Responsável', 'Data de Abertura', 'Data de Conclusão']
const SEPARADOR = ';' // use ',' se o destino esperar CSV "americano"
const fmtData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: FUSO_ORDENS }) : '')

// Data "pura" (sem hora) no fuso de São Paulo, para o Excel não deslocar o dia
function dataParaExcel(d) {
  if (!d) return null
  const [dia, mes, ano] = fmtData(d).split('/').map(Number)
  return new Date(Date.UTC(ano, mes - 1, dia))
}

async function buscarOrdens(filtros) {
  return prisma.ordemServico.findMany({
    where: montarWhere(filtros),
    select: {
      codigo: true,
      titulo: true,
      dataAbertura: true,
      dataConclusao: true,
      responsavel: { select: { nome: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ---------- CSV ----------
function celula(valor) {
  let s = String(valor ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`            // evita injeção de fórmula
  if (/[;,"\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`
  return s
}

export async function gerarCsvOrdens(filtros) {
  const ordens = await buscarOrdens(filtros)

  const linhas = [
    COLUNAS,
    ...ordens.map((o) => [
      o.codigo,
      o.titulo,
      o.responsavel?.nome ?? 'Não atribuído',
      fmtData(o.dataAbertura),
      fmtData(o.dataConclusao),
    ]),
  ]

  // \uFEFF = BOM, para o Excel reconhecer UTF-8 (acentos)
  return '\uFEFF' + linhas.map((l) => l.map(celula).join(SEPARADOR)).join('\r\n') + '\r\n'
}

// ---------- XLSX (formatado) ----------
export async function gerarXlsxOrdens(filtros) {
  const ordens = await buscarOrdens(filtros)

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Ordens de serviço', {
    views: [{ state: 'frozen', ySplit: 1 }], // cabeçalho fixo ao rolar
  })

  ws.columns = [
    { header: COLUNAS[0], key: 'codigo', width: 16 },
    { header: COLUNAS[1], key: 'titulo', width: 40 },
    { header: COLUNAS[2], key: 'responsavel', width: 24 },
    { header: COLUNAS[3], key: 'abertura', width: 18, style: { numFmt: 'dd/mm/yyyy' } },
    { header: COLUNAS[4], key: 'conclusao', width: 20, style: { numFmt: 'dd/mm/yyyy' } },
  ]

  for (const o of ordens) {
    ws.addRow({
      codigo: o.codigo,
      titulo: o.titulo,
      responsavel: o.responsavel?.nome ?? 'Não atribuído',
      abertura: dataParaExcel(o.dataAbertura),
      conclusao: dataParaExcel(o.dataConclusao),
    })
  }

  // Cabeçalho em negrito, com fundo cinza claro
  const cab = ws.getRow(1)
  cab.font = { bold: true }
  cab.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EBEF' } }
  cab.alignment = { vertical: 'middle' }

  // Botões de filtro no cabeçalho
  ws.autoFilter = { from: 'A1', to: 'E1' }

  return Buffer.from(await wb.xlsx.writeBuffer())
}