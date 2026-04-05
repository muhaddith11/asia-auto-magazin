import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  console.log('Initializing Prisma Client...')
  return new PrismaClient({
    log: ['error'],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Lazy initialization to avoid build-time crashes
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop, receiver) => {
    // Skip initialization during Next.js build phase if possible, 
    // but more importantly, only initialize on first access.
    if (!globalThis.prisma) {
      globalThis.prisma = prismaClientSingleton()
    }
    return Reflect.get(globalThis.prisma, prop, receiver)
  }
})
