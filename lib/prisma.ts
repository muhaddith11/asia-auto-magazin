import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL
  
  // Workaround for problematic prisma+postgres URLs that force "client" engine
  if (url?.startsWith('prisma+postgres://')) {
    console.warn('Converting prisma+postgres URL to postgresql for compatibility')
    url = url.replace('prisma+postgres://', 'postgresql://')
    // Remove query params that are specific to Prisma Postgres if necessary
    url = url.split('?')[0] 
  }

  console.log('Initializing Prisma Client with engine-type safety...')
  return new PrismaClient({
    log: ['error'],
    datasources: url ? {
      db: { url }
    } : undefined
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
