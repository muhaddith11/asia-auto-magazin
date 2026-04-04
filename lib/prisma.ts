import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined
}

// Lazy initialization: Prisma only starts when first accessed
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop, receiver) => {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = prismaClientSingleton()
    }
    return Reflect.get(globalForPrisma.prisma, prop, receiver)
  }
})
