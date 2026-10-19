# Altave OS — Backend (Prisma + Postgres/RDS)

API em Node/Express na frente do banco Postgres via **Prisma** (`prisma/schema.prisma` é o
schema que você mandou: `usuarios`, `ordens_servico`, `historico`, `logs_auditoria`).

## Rotas
- POST  /api/auth/login              { email, senha } -> { token, user }
- GET   /api/ordens                  (Bearer token) lista as OS; cada item traz `podeEncerrar` e `podeReabrir` para o usuário logado
- POST  /api/ordens                  (Bearer token) { titulo, descricao, prioridade, responsavel }
- PATCH /api/ordens/:codigo/status   (Bearer token) { status } — apenas "Aberta" ou "Em andamento".
                                     Reabrir uma OS concluída: somente GESTOR/ADMIN.
- POST  /api/ordens/:codigo/encerrar (Bearer token) { solucao } — **único caminho para concluir uma OS**.
                                     Exige `solucao` (10 a 5000 caracteres). Permitido ao responsável pela OS,
                                     GESTOR ou ADMIN. 409 se a OS já estiver concluída.
- GET   /api/ordens/:codigo/historico (Bearer token) linha do tempo da OS: { codigo, titulo, eventos: [{ tipo, de, para, quem, em, observacao }] },
                                     do mais antigo ao mais recente. `tipo`: criacao | mudanca | encerramento | reabertura.
- GET   /api/usuarios                (Bearer token)
- POST  /api/usuarios                (GESTOR/ADMIN) { nome, email, senha, perfil }
- PATCH /api/usuarios/:id/ativo      (GESTOR/ADMIN) { ativo }

Encerrar grava a `solucao` e o `encerradoPorId` (quem encerrou; a API devolve o nome em `encerradoPor`) na OS, uma linha em `historico` (com `observacao` = solução) e `encerrar_os`
em `logs_auditoria`. Reabrir grava `reabrir_os`; outras mudanças de status gravam `mudar_status`.
Criar OS grava `criar_os`.

> Migrations: `20261008120000_encerramento_os` (colunas `ordens_servico.solucao` e `historico.observacao`) e
> `20261008223000_encerrado_por` (coluna `ordens_servico.encerrado_por_id`, com preenchimento das OS já concluídas).
> Rode `npx prisma migrate deploy` (ou `migrate dev`) antes de subir esta versão.

## Subir com o RDS da AWS

1. Crie o banco Postgres no RDS e libere o Security Group pra sua máquina/servidor (porta 5432).
2. cp .env.example .env — preencha DATABASE_URL com o endpoint do RDS
   (adicione `?sslmode=require` no final se o RDS exigir SSL).
3. npm install                → instala tudo, incluindo o Prisma Client (postinstall roda `prisma generate`)
4. npx prisma migrate deploy  → cria as tabelas no RDS a partir do schema.prisma
   (se preferir gerar a migration antes, localmente: `npx prisma migrate dev --name init`)
5. npm run seed               → cria usuários de teste (senha "12345678" pra todos):
   carlos.dias@altave.com, joao.pedro@altave.com, ana.ferreira@altave.com
6. npm run dev  (ou npm start)

A API sobe em http://localhost:3001. No front, aponte VITE_API_URL=http://localhost:3001/api.

## Local sem RDS (testar rápido)
docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=altave postgres
Deixe o DATABASE_URL do .env.example como está (aponta pro localhost) e siga os passos 3-6.

## Observação sobre o schema
O `schema.prisma` não tem um campo de "prazo previsto" pra OS (só `dataAbertura`/`dataConclusao`).
O card do Kanban no front tem um campo de prazo — hoje ele fica vazio/null vindo da API porque
o dado não existe no banco. Se quiser esse prazo de volta, é só adicionar um `DateTime? prazo`
em `OrdemServico` no schema.prisma e rodar `npx prisma migrate dev` de novo — o mapeamento em
`lib/mapping.js`/`routes/ordens.js` (variável `prazoInterno`) já está isolado pra plugar isso fácil.

Login agora é por **email** (não mais "usuario.sobrenome") — reflita isso na tela de login do front
se ainda estiver pedindo "usuário".

