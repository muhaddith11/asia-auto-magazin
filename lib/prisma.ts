import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  console.log('Prisma client initializing...')
  return new PrismaClient({
    log: ['error', 'warn'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
