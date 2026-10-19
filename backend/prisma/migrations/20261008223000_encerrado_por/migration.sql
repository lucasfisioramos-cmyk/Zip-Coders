-- AlterTable
ALTER TABLE "ordens_servico" ADD COLUMN "encerrado_por_id" TEXT;

-- CreateIndex
CREATE INDEX "ordens_servico_encerrado_por_id_idx" ON "ordens_servico"("encerrado_por_id");

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_encerrado_por_id_fkey" FOREIGN KEY ("encerrado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Preenche as OS já concluídas com quem fez a última transição para CONCLUIDA (a autoria já estava no historico).
UPDATE "ordens_servico" o
SET "encerrado_por_id" = h."usuario_id"
FROM (
  SELECT DISTINCT ON ("ordem_id") "ordem_id", "usuario_id"
  FROM "historico"
  WHERE "status_novo" = 'CONCLUIDA'
  ORDER BY "ordem_id", "created_at" DESC
) h
WHERE h."ordem_id" = o."id" AND o."status" = 'CONCLUIDA';
