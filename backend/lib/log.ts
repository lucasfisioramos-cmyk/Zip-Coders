import { PrismaClient, Prisma, PrioridadeOS } from "@prisma/client";

const prisma = new PrismaClient();

// ---------- Criação do rascunho ----------
export async function criarRascunho(
  usuarioId: string,
  dados: { codigo: string; titulo: string; descricao: string }
) {
  return prisma.$transaction(async (tx) => {
    const os = await tx.ordemServico.create({
      data: { ...dados, solicitanteId: usuarioId },
    });

    await tx.historico.create({
      data: { ordemId: os.id, usuarioId, statusAnterior: null, statusNovo: "RASCUNHO" },
    });

    await tx.eventoOS.create({
      data: {
        ordemId: os.id,
        usuarioId,
        tipo: "CRIACAO",
        mensagem: `Rascunho ${os.codigo} criado`,
      },
    });

    return os;
  });
}

// ---------- Edição com registro automático das mudanças ----------
type DadosAtualizacao = {
  titulo?: string;
  descricao?: string;
  prioridade?: PrioridadeOS;
  responsavelId?: string | null;
};

export async function atualizarOrdem(
  ordemId: string,
  usuarioId: string,
  dados: DadosAtualizacao
) {
  return prisma.$transaction(async (tx) => {
    const antes = await tx.ordemServico.findUniqueOrThrow({ where: { id: ordemId } });
    const depois = await tx.ordemServico.update({ where: { id: ordemId }, data: dados });

    const eventos: Prisma.EventoOSCreateManyInput[] = [];

    for (const campo of ["titulo", "descricao", "prioridade"] as const) {
      if (dados[campo] !== undefined && dados[campo] !== antes[campo]) {
        eventos.push({
          ordemId,
          usuarioId,
          tipo: "CAMPO_ALTERADO",
          mensagem: `Campo "${campo}" alterado`,
          detalhes: { campo, de: antes[campo], para: depois[campo] },
        });
      }
    }

    if (dados.responsavelId !== undefined && dados.responsavelId !== antes.responsavelId) {
      eventos.push({
        ordemId,
        usuarioId,
        tipo: "RESPONSAVEL_ALTERADO",
        mensagem: "Responsável alterado",
        detalhes: { de: antes.responsavelId, para: depois.responsavelId },
      });
    }

    if (eventos.length > 0) {
      await tx.eventoOS.createMany({ data: eventos });
    }

    return depois;
  });
}

// ---------- Abertura (RASCUNHO -> ABERTA) ----------
function listarPendenciasParaAbertura(os: {
  titulo: string;
  descricao: string;
  prioridade: PrioridadeOS | null;
  responsavelId: string | null;
}): string[] {
  const pendencias: string[] = [];
  if (!os.titulo?.trim()) pendencias.push("Título é obrigatório.");
  if (!os.descricao?.trim()) pendencias.push("Descrição é obrigatória.");
  if (!os.prioridade) pendencias.push("Prioridade é obrigatória para abrir a OS.");
  if (!os.responsavelId) pendencias.push("É necessário definir um responsável.");
  return pendencias;
}

export async function abrirOrdemServico(ordemId: string, usuarioId: string) {
  const os = await prisma.ordemServico.findUniqueOrThrow({ where: { id: ordemId } });

  if (os.status !== "RASCUNHO") {
    throw new Error("Só é possível abrir uma OS que está em rascunho.");
  }

  const pendencias = listarPendenciasParaAbertura(os);

  if (pendencias.length > 0) {
    // Registrado FORA de transação: se estivesse dentro de uma que falha,
    // o rollback apagaria o próprio registro do erro.
    await prisma.eventoOS.create({
      data: {
        ordemId,
        usuarioId,
        tipo: "ERRO_VALIDACAO",
        severidade: "ERRO",
        mensagem: "Tentativa de abrir OS com campos incompletos",
        detalhes: { pendencias },
      },
    });
    throw new Error("Não é possível abrir a OS:\n" + pendencias.join("\n"));
  }

  return prisma.$transaction([
    prisma.ordemServico.update({
      where: { id: ordemId },
      data: { status: "ABERTA", dataAbertura: new Date() },
    }),
    prisma.historico.create({
      data: { ordemId, usuarioId, statusAnterior: "RASCUNHO", statusNovo: "ABERTA" },
    }),
    prisma.eventoOS.create({
      data: {
        ordemId,
        usuarioId,
        tipo: "STATUS_ALTERADO",
        mensagem: "Status alterado de RASCUNHO para ABERTA",
        detalhes: { de: "RASCUNHO", para: "ABERTA" },
      },
    }),
  ]);
}

// ---------- User story: consultar o histórico completo ----------
export async function consultarHistoricoCompleto(ordemId: string) {
  return prisma.eventoOS.findMany({
    where: { ordemId },
    orderBy: { createdAt: "asc" },
    include: {
      usuario: { select: { id: true, nome: true, perfil: true } },
    },
  });
}

// ---------- Só o que merece atenção (erros e avisos) ----------
export async function consultarAlertasDaOrdem(ordemId: string) {
  return prisma.eventoOS.findMany({
    where: { ordemId, severidade: { in: ["AVISO", "ERRO"] } },
    orderBy: { createdAt: "desc" },
  });
}