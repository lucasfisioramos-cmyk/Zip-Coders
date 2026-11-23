import { execFileSync } from 'node:child_process'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { TEST_EMAIL, validateStagingEnv, verifyStagingDb } from './isolation.js'

try {
  validateStagingEnv()
  await verifyStagingDb(prisma)
  execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { stdio: 'inherit' })
  await prisma.usuario.upsert({
    where: { email: TEST_EMAIL },
    update: {},
    create: {
      nome: 'Administrador de Homologação',
      email: TEST_EMAIL,
      perfil: 'ADMIN',
      senhaHash: await bcrypt.hash(process.env.STAGING_TEST_PASSWORD, 10),
    },
  })
} catch (err) {
  console.error('Falha ao preparar homologação:', err.message)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
