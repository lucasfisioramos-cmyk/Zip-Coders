export const TEST_EMAIL = 'homologacao@example.test'

export function validateStagingEnv(env = process.env) {
  if (env.APP_ENV !== 'staging') throw new Error('APP_ENV deve ser staging.')
  let url
  try {
    url = new URL(env.DATABASE_URL)
  } catch {
    throw new Error('DATABASE_URL de homologação ausente ou inválida.')
  }

  if (url.protocol !== 'postgresql:' || url.hostname !== 'staging-db' ||
      url.port !== '5432' || url.pathname !== '/zip_coders_staging' ||
      url.username !== 'zip_staging' || url.search !== '?schema=public' || url.hash) {
    throw new Error('Homologação exige o banco exclusivo do Compose.')
  }

  const secrets = [url.password, env.JWT_SECRET, env.STAGING_TEST_PASSWORD]
  if (secrets.some((value) => !/^[0-9a-f]{64}$/.test(value ?? '')) || new Set(secrets).size !== 3) {
    throw new Error('Use três segredos diferentes de 64 caracteres hexadecimais.')
  }

  if (env.SMTP_HOST) throw new Error('SMTP externo deve ficar desativado em homologação.')
}

export async function verifyStagingDb(prisma) {
  const [database] = await prisma.$queryRaw`
    SELECT current_database()::text AS nome, current_user::text AS usuario,
           EXISTS (
             SELECT 1 FROM homologacao_guard.identidade WHERE ambiente = 'zip-coders-staging-v1'
           ) AS homologacao
  `
  if (database?.nome !== 'zip_coders_staging' || database.usuario !== 'zip_staging' || !database.homologacao) {
    throw new Error('Banco conectado não corresponde à homologação.')
  }
}

export async function checkStagingReady(prisma) {
  await verifyStagingDb(prisma)
  await prisma.usuario.findFirst({ select: { id: true } })
  await prisma.ordemServico.findFirst({ select: { id: true } })
}
