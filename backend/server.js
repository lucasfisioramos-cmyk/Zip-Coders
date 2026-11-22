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
import { requireAuth, requireRoles } from './middleware/auth.js'
import { PERFIL_LABEL } from './lib/mapping.js'

const app = express()
app.use(cors({ exposedHeaders: ['X-User-Perfil'] }))
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

app.get(['/api/admin/perfis', '/admin/perfis'], requireAuth, requireRoles('ADMIN'), (_req, res) => {
  res.json(Object.entries(PERFIL_LABEL).map(([value, label]) => ({ value, label })))
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ erro: 'Erro interno do servidor.' })
})

// Importar a aplicação nos testes não abre uma porta fixa.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => console.log(`Altave API rodando em http://localhost:${PORT}`))
}

export default app
