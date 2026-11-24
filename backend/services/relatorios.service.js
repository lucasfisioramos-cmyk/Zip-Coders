import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import { prisma } from '../lib/prisma.js'
import { FUSO_ORDENS, montarWhere } from '../lib/filtros-ordens.js'
import { PRIORIDADE_DB_TO_API, STATUS_DB_TO_API } from '../lib/mapping.js'

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
      prioridade: true,
      status: true,
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

export async function gerarPdfOrdens(filtros) {
  const ordens = await buscarOrdens(filtros)
  const pdf = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 36,
    info: { Title: 'Relatório de ordens de serviço' },
  })

  pdf.font('Helvetica-Bold').fontSize(20).fillColor('#233F5A')
    .text('Relatório de ordens de serviço')
  pdf.moveDown(0.4).font('Helvetica').fontSize(10).fillColor('#283849')
    .text(`Total de ordens: ${ordens.length}`)
  pdf.moveDown()

  if (ordens.length === 0) {
    pdf.text('Nenhuma ordem encontrada.')
  } else {
    pdf.table({
      headerRows: 1,
      columnStyles: [110, '*', 72, 110, 90, 77, 88],
      defaultStyle: {
        padding: 6,
        border: [0, 0, 0.5, 0],
        borderColor: '#DCE4EC',
        textColor: '#283849',
      },
      rowStyles: (indice) => indice === 0
        ? { font: { src: 'Helvetica-Bold' }, backgroundColor: '#E8F1FA', type: 'TH' }
        : {},
      data: [
        ['OS', 'Título', 'Prioridade', 'Responsável', 'Status', 'Aberta em', 'Concluída em'],
        ...ordens.map((ordem) => [
          ordem.codigo,
          ordem.titulo,
          PRIORIDADE_DB_TO_API[ordem.prioridade],
          ordem.responsavel?.nome ?? 'Não atribuído',
          STATUS_DB_TO_API[ordem.status],
          fmtData(ordem.dataAbertura),
          fmtData(ordem.dataConclusao),
        ]),
      ],
    })
  }

  pdf.end()
  const partes = []
  for await (const parte of pdf) partes.push(parte)
  return Buffer.concat(partes)
}
