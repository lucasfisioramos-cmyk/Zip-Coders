import { BeforeAll, AfterAll, Before, Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import jwt from 'jsonwebtoken'

setDefaultTimeout(30_000)
let prisma, server, baseURL
const schema = `rbac_test_${randomUUID().replaceAll('-', '')}`
const secret = randomUUID()
const sign = (id, perfil) => jwt.sign({ id, perfil }, secret, { expiresIn: '1h' })

BeforeAll(async () => {
  if (!process.env.TEST_DATABASE_URL) throw new Error('Defina TEST_DATABASE_URL para um PostgreSQL de testes. A suíte cria e remove apenas um schema exclusivo.')
  const url = new URL(process.env.TEST_DATABASE_URL)
  url.searchParams.set('schema', schema)
  process.env.DATABASE_URL = url.toString()
  process.env.JWT_SECRET = secret
  execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--skip-generate'], { env: process.env, stdio: 'pipe' })
  prisma = (await import('../../lib/prisma.js')).prisma
  const app = (await import('../../server.js')).default
  server = await new Promise((resolve, reject) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener))
    listener.on('error', reject)
  })
  baseURL = `http://127.0.0.1:${server.address().port}`
})

AfterAll(async () => {
  if (server) await new Promise((resolve) => server.close(resolve))
  if (prisma) {
    await prisma.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`)
    await prisma.$disconnect()
  }
})

Before(async function () {
  await prisma.logAuditoria.deleteMany()
  await prisma.ordemServico.deleteMany()
  await prisma.usuario.deleteMany()
  for (const perfil of ['ADMIN', 'GESTOR', 'EXECUTOR', 'USUARIO']) {
    await prisma.usuario.create({ data: { id: perfil, nome: perfil, email: `${perfil}@teste.local`, senhaHash: 'fixture-sem-login', perfil } })
  }
  await prisma.usuario.create({ data: { id: 'carlos', nome: 'Carlos', email: 'carlos@teste.local', senhaHash: 'fixture-sem-login', perfil: 'EXECUTOR' } })
  this.token = undefined
  this.carlosToken = undefined
})

async function request(world, method, path, body, token = world.token) {
  world.response = await fetch(`${baseURL}${path}`, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  world.body = world.response.headers.get('content-type')?.includes('application/json')
    ? await world.response.json()
    : await world.response.text()
}

Given('que existem os quatro perfis e Carlos é Executor', async () => {
  assert.equal(await prisma.usuario.count(), 5)
})
Given('que estou autenticado como {string}', function (perfil) { this.token = sign(perfil, perfil) })
Given('que Carlos está autenticado e seu token é mantido', function () { this.carlosToken = sign('carlos', 'EXECUTOR') })
Given('que Carlos está autenticado como Gestor e seu token é mantido', async function () {
  await prisma.usuario.update({ where: { id: 'carlos' }, data: { perfil: 'GESTOR' } })
  this.carlosToken = sign('carlos', 'GESTOR')
})
Given('que uso uma sessão {string}', async function (session) {
  if (session === 'ausente') this.token = undefined
  if (session === 'inválida') this.token = 'invalido'
  if (session === 'expirada') this.token = jwt.sign({ id: 'ADMIN' }, secret, { expiresIn: -1 })
  if (session === 'excluída') this.token = sign('inexistente', 'ADMIN')
  if (session === 'inativa') {
    this.token = sign('ADMIN', 'ADMIN')
    await prisma.usuario.update({ where: { id: 'ADMIN' }, data: { ativo: false } })
  }
})
When('tento acessar {string}', async function (path) { await request(this, 'GET', path) })
When('altero o papel de Carlos para {string}', async function (perfil) { await request(this, 'PATCH', '/api/usuarios/carlos/perfil', { perfil }) })
When('envio uma lista como perfil de Carlos', async function () { await request(this, 'PATCH', '/api/usuarios/carlos/perfil', { perfil: ['ADMIN'] }) })
When('altero o perfil de um usuário inexistente', async function () { await request(this, 'PATCH', '/api/usuarios/inexistente/perfil', { perfil: 'GESTOR' }) })
When('tento gerenciar usuários com {string} em {string}', async function (method, path) { await request(this, method, path, { perfil: 'ADMIN', ativo: false }) })
Then('recebo HTTP {int}', function (status) { assert.equal(this.response.status, status, JSON.stringify(this.body)) })
Then('recebo HTTP {int} e a mensagem {string}', function (status, message) {
  assert.equal(this.response.status, status)
  assert.equal(this.body.erro, message)
})
Then('o perfil {string} está persistido e auditado', async function (perfil) {
  assert.equal(this.response.status, 200, JSON.stringify(this.body))
  assert.equal(this.body.perfil, perfil)
  assert.equal((await prisma.usuario.findUnique({ where: { id: 'carlos' } })).perfil, perfil)
  const logs = await prisma.logAuditoria.findMany({ where: { acao: 'alterar_perfil' } })
  assert.equal(logs.length, 1)
  assert.equal(logs[0].usuarioId, 'ADMIN')
  assert.deepEqual(logs[0].detalhes, { usuarioId: 'carlos', de: perfil === 'GESTOR' ? 'EXECUTOR' : 'GESTOR', para: perfil })
  assert.equal('senhaHash' in this.body, false)
})
Then('Carlos acessa os relatórios na próxima requisição com o mesmo token', async function () {
  await request(this, 'GET', '/api/auth/me', undefined, this.carlosToken)
  assert.equal(this.response.status, 200)
  assert.equal(this.body.user.permissoes.relatorios, true)
  await request(this, 'GET', '/api/relatorios/ordens/exportar', undefined, this.carlosToken)
  assert.equal(this.response.status, 200)
  assert.match(this.response.headers.get('content-type'), /^text\/csv/)
})
Then('a consulta de sessão de Carlos retorna {string}', async function (perfil) {
  await request(this, 'GET', '/api/auth/me', undefined, this.carlosToken)
  assert.equal(this.response.status, 200)
  assert.equal(this.body.user.perfil, perfil)
})
Then('Carlos perde a permissão de relatórios com o mesmo token', async function () {
  await request(this, 'GET', '/api/auth/me', undefined, this.carlosToken)
  assert.equal(this.response.status, 200)
  assert.equal(this.body.user.permissoes.relatorios, false)
  await request(this, 'GET', '/api/relatorios/ordens/exportar', undefined, this.carlosToken)
  assert.equal(this.response.status, 403)
  assert.equal(this.body.erro, 'Acesso não autorizado')
})
Then('Carlos continua Executor sem auditoria de alteração', async function () {
  assert.equal((await prisma.usuario.findUnique({ where: { id: 'carlos' } })).perfil, 'EXECUTOR')
  assert.equal(await prisma.logAuditoria.count({ where: { acao: 'alterar_perfil' } }), 0)
})
Then('recebo os quatro perfis sem dados de senha', function () {
  assert.equal(this.response.status, 200)
  assert.deepEqual(this.body.map((p) => p.value).sort(), ['ADMIN', 'EXECUTOR', 'GESTOR', 'USUARIO'])
  assert.equal(JSON.stringify(this.body).includes('senha'), false)
})
