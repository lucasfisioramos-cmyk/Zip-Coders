import { prisma } from '../lib/prisma.js'

const STATUS_PAINEL = ['ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA']

// Total consolidado de ordens por status, feito pelo banco (uma única consulta)
export async function totaisPorStatus() {
  const grupos = await prisma.ordemServico.groupBy({
    by: ['status'],
    where: { status: { in: STATUS_PAINEL } },
    _count: { _all: true },
  })

  // O groupBy só devolve status que têm ordens; os ausentes entram como 0
  const contagem = Object.fromEntries(grupos.map((g) => [g.status, g._count._all]))

  const abertas = contagem.ABERTA ?? 0
  const emAndamento = contagem.EM_ANDAMENTO ?? 0
  const concluidas = contagem.CONCLUIDA ?? 0

  return {
    abertas,
    emAndamento,
    concluidas,
    total: abertas + emAndamento + concluidas,
    atualizadoEm: new Date().toISOString(),
  }
}