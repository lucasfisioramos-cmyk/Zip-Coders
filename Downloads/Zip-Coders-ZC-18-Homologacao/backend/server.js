import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import ordensRoutes from './routes/ordens.js'
import usuariosRoutes from './routes/usuarios.js'
import dashboardRoutes from './routes/dashboard.js'
import relatoriosRoutes from './routes/relatorios.js'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'
import { fileURLToPath } from 'url'
import { prisma } from './lib/prisma.js'
import { checkStagingReady, validateStagingEnv, verifyStagingDb } from './staging/isolation.js'

const app = express()
app.use(cors())
app.use(express.json())

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/ordens', ordensRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/relatorios', relatoriosRoutes)

if (process.env.APP_ENV === 'staging') {
  validateStagingEnv()
  await verifyStagingDb(prisma)

  app.get('/api/ready', async (_req, res) => {
    try {
      await checkStagingReady(prisma)
      res.json({ ok: true, ambiente: 'staging' })
    } catch {
      res.status(503).json({ ok: false, ambiente: 'staging' })
    }
  })

  app.use('/api', (_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }))
  const frontend = path.join(__dirname, 'public')
  app.use(express.static(frontend))
  app.get('*', (_req, res) => res.sendFile(path.join(frontend, 'index.html')))
}

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ erro: 'Erro interno do servidor.' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Altave API rodando em http://localhost:${PORT}`))
