import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const today = new Date()
    const start = startOfDay(today)
    const end = endOfDay(today)

    // 1. Today's sales
    const todaySales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      include: {
        items: true
      }
    })

    const todayTotal = todaySales.reduce((acc, s) => acc + s.totalAmount, 0)
    
    // Calculate gross profit for today
    const todayGrossProfit = todaySales.reduce((acc, s) => {
      const saleProfit = s.items.reduce((iAcc, item) => {
        return iAcc + (item.priceAtSale - (item.purchasePriceAtSale || 0)) * item.quantity
      }, 0)
      return acc + saleProfit
    }, 0)

    // Calculate expenses for today
    const todayExpenses = await prisma.expense.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      }
    })
    const todayExpensesTotal = todayExpenses.reduce((acc, e) => acc + e.amount, 0)
    
    const todayProfit = todayGrossProfit - todayExpensesTotal

    // 2. Low stock products
    const lowStockCount = await prisma.product.count({
      where: {
        stockQuantity: {
          lt: 10
        }
      }
    })

    // 3. Total customers
    const customersCount = await prisma.customer.count()

    // 4. Total debt
    const debts = await prisma.debt.findMany({
      where: { isPaid: false }
    })
    const totalDebt = debts.reduce((acc, d) => acc + d.amount, 0)

    return NextResponse.json({
      todayTotal,
      todayProfit,
      todaySalesCount: todaySales.length,
      lowStockCount,
      customersCount,
      totalDebt
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
