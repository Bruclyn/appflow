import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma 7 no longer accepts `datasourceUrl` and requires a driver adapter for a
// direct database connection. We wrap the Postgres connection string with the
// official pg adapter. The adapter (and its pool) is only created when we
// actually instantiate a new client, so hot reloads reuse a single pool.
function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
