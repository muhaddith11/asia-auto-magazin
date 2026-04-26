import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id
    
    // Mark all debts as paid for this customer
    await prisma.debt.updateMany({
      where: { 
        customerId,
        isPaid: false 
      },
      data: {
        isPaid: true
      }
    })

    return NextResponse.json({ message: "Qarzlar muvaffaqiyatli to'landi" })
  } catch (error: any) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: "To'lovda xatolik yuz berdi" }, { status: 500 })
  }
}
