import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // Normalize DATABASE_URL if it has the problematic prefix
  if (process.env.DATABASE_URL?.startsWith('prisma+postgres://')) {
    console.warn('Normalizing prisma+postgres URL to postgresql...')
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace('prisma+postgres://', 'postgresql://').split('?')[0]
  }

  return new PrismaClient({
    log: ['error'],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop, receiver) => {
    if (!globalThis.prisma) {
      globalThis.prisma = prismaClientSingleton()
    }
    return Reflect.get(globalThis.prisma, prop, receiver)
  }
})
