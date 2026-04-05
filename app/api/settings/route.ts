import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' }
    })
    if (!settings) {
      const created = await prisma.storeSettings.create({
        data: { id: 'default', name: "Mening Do'konim" }
      })
      return NextResponse.json(created)
    }
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, address, receiptFooter } = body
    const settings = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: { name, phone, address, receiptFooter },
      create: { id: 'default', name, phone, address, receiptFooter }
    })
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
