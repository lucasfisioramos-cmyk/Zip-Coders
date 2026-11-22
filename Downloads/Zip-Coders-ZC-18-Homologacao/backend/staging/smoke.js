import assert from 'node:assert/strict'
import { TEST_EMAIL, validateStagingEnv } from './isolation.js'

validateStagingEnv()
const base = 'http://127.0.0.1:' + process.env.PORT

async function request(path, options) {
  const response = await fetch(base + path, { ...options, signal: AbortSignal.timeout(5000) })
  assert.equal(response.status, 200, path + ' retornou HTTP ' + response.status)
  return response
}

const frontend = await request('/kanban')
assert.match(await frontend.text(), /<div id="root">/)
const login = await request('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: TEST_EMAIL, senha: process.env.STAGING_TEST_PASSWORD }),
})
const { token } = await login.json()
assert.ok(token)

// Exercita a API e o banco repetidamente com o mesmo token.
for (let tentativa = 0; tentativa < 10; tentativa++) {
  const pronta = await request('/api/ready')
  assert.deepEqual(await pronta.json(), { ok: true, ambiente: 'staging' })
  const ordens = await request('/api/ordens', { headers: { Authorization: 'Bearer ' + token } })
  assert.ok(Array.isArray(await ordens.json()))
}

console.log('Homologação validada: frontend, login e 10 consultas ao banco isolado.')
