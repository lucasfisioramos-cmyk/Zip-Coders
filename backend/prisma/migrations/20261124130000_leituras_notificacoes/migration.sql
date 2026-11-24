CREATE TABLE "leituras_notificacoes" (
    "usuario_id" TEXT NOT NULL,
    "historico_id" TEXT NOT NULL,

    CONSTRAINT "leituras_notificacoes_pkey" PRIMARY KEY ("usuario_id", "historico_id")
);

CREATE INDEX "leituras_notificacoes_historico_id_idx" ON "leituras_notificacoes"("historico_id");

ALTER TABLE "leituras_notificacoes" ADD CONSTRAINT "leituras_notificacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "leituras_notificacoes" ADD CONSTRAINT "leituras_notificacoes_historico_id_fkey" FOREIGN KEY ("historico_id") REFERENCES "historico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
