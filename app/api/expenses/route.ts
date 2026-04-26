import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(expenses)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, category, description } = body

    if (!amount || !category) {
      return NextResponse.json({ error: 'Amount and category are required' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        category,
        description
      }
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
