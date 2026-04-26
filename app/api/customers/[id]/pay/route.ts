import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id
    const body = await request.json()
    const { amount: paymentAmount } = body // Amount being paid

    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json({ error: "To'lov summasi noto'g'ri" }, { status: 400 })
    }

    let remainingPayment = parseFloat(paymentAmount)

    // Get all unpaid debts for this customer, oldest first (FIFO)
    const unpaidDebts = await prisma.debt.findMany({
      where: { 
        customerId,
        isPaid: false 
      },
      orderBy: { createdAt: 'asc' }
    })

    await prisma.$transaction(async (tx) => {
      for (const debt of unpaidDebts) {
        if (remainingPayment <= 0) break

        if (remainingPayment >= debt.amount) {
          // Pay this debt fully
          await tx.debt.update({
            where: { id: debt.id },
            data: { isPaid: true }
          })
          remainingPayment -= debt.amount
        } else {
          // Pay this debt partially
          await tx.debt.update({
            where: { id: debt.id },
            data: { amount: debt.amount - remainingPayment }
          })
          remainingPayment = 0
        }
      }
    })

    return NextResponse.json({ message: "To'lov qabul qilindi" })
  } catch (error: any) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: "To'lovda xatolik yuz berdi" }, { status: 500 })
  }
}
