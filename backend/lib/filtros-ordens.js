import { STATUS_API_TO_DB } from './mapping.js'

export const FUSO_ORDENS = 'America/Sao_Paulo'
const DIA = 24 * 60 * 60 * 1000
const formatador = new Intl.DateTimeFormat('sv-SE', { timeZone: FUSO_ORDENS, dateStyle: 'short' })

export class FiltroInvalidoError extends Error {}

function lerData(valor) {
  const data = new Date(valor + 'T00:00:00Z')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(data.getTime()) ||
      data.toISOString().slice(0, 10) !== valor || valor.startsWith('0000')) {
    throw new FiltroInvalidoError('Informe uma data válida no formato AAAA-MM-DD.')
  }
  return data.getTime()
}

// Encontra a primeira hora local do dia, inclusive em datas com horário de verão.
function inicioDoDia(diaUtc) {
  const data = new Date(diaUtc).toISOString().slice(0, 10)
  let antes = diaUtc - DIA
  let depois = diaUtc + DIA
  while (depois - antes > 1) {
    const meio = Math.floor((antes + depois) / 2)
    if (formatador.format(meio) < data) antes = meio
    else depois = meio
  }
  return new Date(depois)
}

export function lerFiltros(query) {
  const filtros = {}
  for (const chave of ['status', 'responsavel', 'periodo', 'dataInicio', 'dataFim']) {
    const valor = query[chave]
    if (valor === undefined) continue
    if (typeof valor !== 'string') throw new FiltroInvalidoError('Filtro inválido: ' + chave)
    filtros[chave] = valor
  }
  return filtros
}

export function montarWhere({ status, responsavel, periodo, dataInicio, dataFim }) {
  const where = {}

  if (status && status !== 'todos') {
    const statusDb = STATUS_API_TO_DB[status]
    if (!Object.hasOwn(STATUS_API_TO_DB, status)) throw new FiltroInvalidoError('Status inválido.')
    where.status = statusDb
  }

  if (responsavel && responsavel !== 'todos') {
    if (responsavel === 'Não atribuído') where.responsavelId = null
    else where.responsavel = { is: { nome: responsavel } }
  }

  if (dataInicio || dataFim) {
    if (dataInicio && dataFim && dataInicio > dataFim) {
      throw new FiltroInvalidoError('A data inicial deve ser anterior ou igual à data final.')
    }
    where.dataAbertura = {
      ...(dataInicio && { gte: inicioDoDia(lerData(dataInicio)) }),
      ...(dataFim && { lt: inicioDoDia(lerData(dataFim) + DIA) }),
    }
  } else if (periodo && periodo !== 'todos') {
    const dias = Number(periodo)
    if (!Number.isInteger(dias) || dias < 1 || dias > 3650) {
      throw new FiltroInvalidoError('Período inválido.')
    }
    where.dataAbertura = { gte: new Date(Date.now() - dias * DIA) }
  }

  return where
}
