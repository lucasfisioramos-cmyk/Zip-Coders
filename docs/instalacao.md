# Manual de instalação e implantação

A aplicação usa React e Vite no frontend, Node.js e Express na API e PostgreSQL com Prisma. Os comandos abaixo usam um terminal Bash ou Zsh. No Windows, use o WSL.

## Instalação local

**Pré-requisitos:** Git, Node.js 24 com npm, curl, OpenSSL e Docker com Compose v2. Verifique com `git --version`, `node -v`, `npm -v`, `openssl version` e `docker compose version`. As portas locais padrão são 55432 (PostgreSQL), 3001 (API) e 5173 (frontend).

### 1. Clone e configure

```sh
git clone https://github.com/lucasfisioramos-cmyk/Zip-Coders.git
docker compose -f compose.local.yaml up -d --wait
```

Copie o valor gerado para `JWT_SECRET` em `backend/.env`. As outras variáveis dos exemplos já correspondem ao setup local. O SMTP fica desabilitado por padrão e as mensagens são simuladas no console da API.

### 2. Suba o banco local

Na raiz do repositório:

```sh
docker compose -f compose.local.yaml up -d --wait
docker compose -f compose.local.yaml ps
```

O PostgreSQL deve aparecer como `healthy`. Ele usa um volume persistente e publica a porta somente em `127.0.0.1:55432`. Quem já tem um PostgreSQL local pode usar um banco vazio exclusivo, com usuário proprietário, e ajustar `DATABASE_URL` no lugar de executar o Compose. O formato é `postgresql://USUARIO:SENHA@127.0.0.1:PORTA/BANCO?schema=public`.

### 3. Instale e inicie a API

```sh
cd backend
npm ci
npx prisma migrate deploy
npm run seed
npm run dev
```

`npm ci` gera o Prisma Client. `migrate deploy` aplica as migrations versionadas. O seed cria usuários e ordens fictícias para o teste local. Deixe esse terminal aberto.

### 4. Inicie o frontend

Em outro terminal, a partir da raiz do repositório:

```sh
cd altave-frontend
npm ci
npm run dev -- --strictPort
```

Abra [http://localhost:5173](http://localhost:5173) e entre com `carlos.dias@altave.com` e senha `12345678`. O Kanban deve mostrar as ordens criadas pelo seed. A [documentação Swagger](http://localhost:3001/api-docs) mostra as rotas da API.

### 5. Confirme a API e o banco

Execute em outro terminal:

```sh
curl -fsS http://localhost:3001/api/health
# Esperado: {"ok":true}

TOKEN=$(curl -fsS http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"carlos.dias@altave.com","senha":"12345678"}' \
  | node -pe 'JSON.parse(require("node:fs").readFileSync(0, "utf8")).token')
curl -fsS http://localhost:3001/api/ordens -H "Authorization: Bearer $TOKEN"
unset TOKEN
```

O login e a consulta autenticada confirmam que a API lê o banco. A consulta deve devolver a lista de ordens em JSON.

Pare os processos Node com Ctrl+C em cada terminal. Para parar o banco e manter os dados:

```sh
docker compose -f compose.local.yaml down
```

## Implantação em homologação

Use um servidor acessível pela rede interna ou VPN, Node.js 24, um serviço de processos para manter a API em execução e um servidor HTTP que sirva o frontend e faça proxy para a API. Provisione uma instância PostgreSQL de homologação, com banco e credenciais exclusivos. Use dados fictícios.

### 1. Configure a API

No checkout da versão a homologar, copie `backend/.env.example` para `backend/.env`, restrinja as permissões do arquivo com `chmod 600 backend/.env` e preencha:

| Variável | Valor em homologação |
| --- | --- |
| `DATABASE_URL` | URL da instância de homologação, como `postgresql://USUARIO:SENHA@HOST:5432/BANCO?schema=public&sslmode=require` quando o servidor exige TLS. Codifique caracteres reservados da senha na URL. |
| `JWT_SECRET` | Valor exclusivo gerado com `openssl rand -hex 32`. |
| `PORT` | `3001`, acessível somente ao proxy ou aos serviços da rede privada. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Mantenha `SMTP_HOST` vazio para simular e-mails, ou configure um serviço de captura de testes. |

Instale e aplique as migrations:

```sh
cd backend
npm ci
npx prisma migrate deploy
```

Para o primeiro acesso a um banco vazio, crie uma conta de homologação no próprio servidor. Substitua o endereço do exemplo e informe uma senha exclusiva quando solicitado:

```sh
export HOMOLOG_ADMIN_EMAIL='admin.homolog@example.test'
printf 'Senha da conta de homologação: '
IFS= read -rs HOMOLOG_ADMIN_PASSWORD
printf '\n'
export HOMOLOG_ADMIN_PASSWORD
node --env-file=.env --input-type=module <<'JS'
import bcrypt from 'bcryptjs'
import { prisma } from './lib/prisma.js'

try {
  const email = process.env.HOMOLOG_ADMIN_EMAIL
  const senha = process.env.HOMOLOG_ADMIN_PASSWORD
  if (!email || !senha || senha.length < 12 || Buffer.byteLength(senha, 'utf8') > 72) {
    throw new Error('Informe o e-mail e uma senha de pelo menos 12 caracteres e no máximo 72 bytes.')
  }
  await prisma.usuario.create({
    data: { email, nome: 'Administrador de Homologação', perfil: 'ADMIN', senhaHash: await bcrypt.hash(senha, 10) },
  })
} finally {
  await prisma.$disconnect()
}
JS
unset HOMOLOG_ADMIN_PASSWORD HOMOLOG_ADMIN_EMAIL
```

Execute `npm start` dentro de `backend/`. A API lê `backend/.env` ao iniciar.

Para manter a API ativa em Linux com systemd, salve o exemplo em `/etc/systemd/system/zip-coders-homolog.service`. Troque o usuário, o caminho do checkout e o caminho de `node` pelos usados no servidor. A conta de serviço precisa ler o checkout e o arquivo `backend/.env`.

```ini
[Unit]
Description=Zip Coders API de homologação
After=network-online.target
Wants=network-online.target

[Service]
User=zip-coders
WorkingDirectory=/srv/zip-coders/repo/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now zip-coders-homolog
sudo systemctl status zip-coders-homolog
```

### 2. Gere e publique o frontend

A partir da raiz, gere o build com o frontend e a API no mesmo domínio:

```sh
cd altave-frontend
npm ci
VITE_API_URL=/api npm run build
```

Publique o conteúdo de `altave-frontend/dist/` no diretório estático do servidor HTTP. Configure o domínio interno com HTTPS e permita acesso somente à equipe. Aponte `/api/` para a API preservando o prefixo e sirva `index.html` nas rotas do React. Exemplo dentro do bloco HTTPS do Nginx, com o proxy no mesmo servidor:

```nginx
root /srv/zip-coders/frontend;

location /api/ {
    proxy_pass http://127.0.0.1:3001;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

Substitua `/srv/zip-coders/frontend` pelo diretório onde publicou os arquivos. Se frontend e API estiverem em domínios diferentes, use a URL HTTPS completa da API terminando em `/api` no momento do build. Gere outro build sempre que `VITE_API_URL` mudar.

### 3. Valide a implantação

- Abra o domínio de homologação e confirme que `/api/health` retorna `{"ok":true}`.
- Entre pela interface com a conta de homologação e crie uma OS fictícia. Recarregue a página e confira se a ordem continua no Kanban.
- Abra o histórico da OS e recarregue a rota direta. O proxy deve entregar o frontend e a API deve carregar o histórico.

Em atualizações, faça backup do banco de homologação, instale a nova revisão, execute `npm ci` e `npx prisma migrate deploy` novamente no backend, reinicie a API, publique o novo `dist/` e repita a validação.

## Problemas comuns

| Sintoma | Verificação |
| --- | --- |
| Docker não responde | Inicie o Docker Desktop ou o daemon e confira `docker info`. |
| API retorna erro de conexão ou tabelas ausentes | Confira `DATABASE_URL`, teste o acesso ao PostgreSQL e rode `npx prisma migrate status` e `npx prisma migrate deploy` dentro de `backend/`. |
| Login falha ou lista vem vazia no primeiro teste local | Execute `npm run seed` depois das migrations e use o e-mail completo da conta local. |
| Tela abre, mas a API não responde no navegador | Confira a URL base, o prefixo `/api` e a configuração do proxy. Em homologação, gere um novo build após corrigir a variável. |
| Porta ocupada | No local, ajuste a porta publicada e a URL correspondente. Se mudar a porta da API, ajuste também `VITE_API_URL`. |
