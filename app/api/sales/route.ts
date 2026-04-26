import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramMessage, formatSaleNotification } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, paymentMethod, totalAmount, customerId, cardInfo } = body

    // Transaction to ensure all or nothing
    const sale = await prisma.$transaction(async (tx: any) => {
      // 1. Check stock for all items
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })

        if (!product) {
          throw new Error(`Mahsulot topilmadi: ${item.name}`)
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(`Omborda yetarli mahsulot yo'q: ${product.name} (Mavjud: ${product.stockQuantity})`)
        }
      }

      // 2. Create the Sale
      const newSale = await tx.sale.create({
        data: {
          totalAmount,
          paymentMethod,
          customerId,
          cardInfo,
          items: {
            create: await Promise.all(items.map(async (item: any) => {
              const product = await tx.product.findUnique({ where: { id: item.productId } })
              return {
                productId: item.productId,
                quantity: item.quantity,
                priceAtSale: item.price,
                purchasePriceAtSale: product?.purchasePrice || 0
              }
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
        },
      })

      // 3. If it's a debt, create a Debt entry
      if (paymentMethod === 'debt' && customerId) {
        await tx.debt.create({
          data: {
            customerId,
            amount: totalAmount,
            description: `Savdo #${newSale.id.slice(-6)}`,
          }
        })
      }

      // 4. Update stock quantities
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

    // Send Telegram Notification asynchronously
    try {
      const message = formatSaleNotification(sale)
      sendTelegramMessage(message)
    } catch (e) {
      console.error('Failed to send telegram notification:', e)
    }

    return NextResponse.json(sale, { status: 201 })
  } catch (error: any) {
    console.error('Sale error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function GET(request: Request) {
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
