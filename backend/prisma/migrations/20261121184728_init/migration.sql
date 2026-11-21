-- CreateEnum
CREATE TYPE "TipoEventoOS" AS ENUM ('CRIACAO', 'STATUS_ALTERADO', 'RESPONSAVEL_ALTERADO', 'CAMPO_ALTERADO', 'ERRO_VALIDACAO', 'ERRO_SISTEMA');

-- CreateEnum
CREATE TYPE "SeveridadeEvento" AS ENUM ('INFO', 'AVISO', 'ERRO');

-- CreateTable
CREATE TABLE "eventos_os" (
    "id" TEXT NOT NULL,
    "ordem_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "tipo" "TipoEventoOS" NOT NULL,
    "severidade" "SeveridadeEvento" NOT NULL DEFAULT 'INFO',
    "mensagem" VARCHAR(255) NOT NULL,
    "detalhes" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_os_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eventos_os_ordem_id_created_at_idx" ON "eventos_os"("ordem_id", "created_at");

-- CreateIndex
CREATE INDEX "eventos_os_severidade_idx" ON "eventos_os"("severidade");

-- CreateIndex
CREATE INDEX "eventos_os_tipo_idx" ON "eventos_os"("tipo");

-- CreateIndex
CREATE INDEX "eventos_os_usuario_id_idx" ON "eventos_os"("usuario_id");

-- AddForeignKey
ALTER TABLE "eventos_os" ADD CONSTRAINT "eventos_os_ordem_id_fkey" FOREIGN KEY ("ordem_id") REFERENCES "ordens_servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_os" ADD CONSTRAINT "eventos_os_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
