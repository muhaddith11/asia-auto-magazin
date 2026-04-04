import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, paymentMethod, totalAmount, customerId, cardInfo } = body

    // Transaction to ensure all or nothing
    const sale = await prisma.$transaction(async (tx: any) => {
      // 1. Create the Sale
      const newSale = await tx.sale.create({
        data: {
          totalAmount,
          paymentMethod,
          customerId,
          cardInfo,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtSale: item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      })

      // 2. If it's a debt, create a Debt entry
      if (paymentMethod === 'debt' && customerId) {
        await tx.debt.create({
          data: {
            customerId,
            amount: totalAmount,
            description: `Savdo #${newSale.id.slice(-6)}`,
          }
        })
      }

      // 2. Update stock quantities
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        })
      }

      return newSale
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error: any) {
    console.error('Sale error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
  }
}
