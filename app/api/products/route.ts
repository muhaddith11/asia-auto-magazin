import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const barcode = searchParams.get('barcode')

  try {
    if (barcode) {
      const product = await prisma.product.findUnique({
        where: { barcode }
      })
      return NextResponse.json(product)
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { barcode: { contains: query, mode: 'insensitive' } },
        ]
      },
      take: 20
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, barcode, purchasePrice, sellingPrice, stockQuantity, categoryId } = body

    const product = await prisma.product.create({
      data: {
        name,
        barcode,
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        stockQuantity: parseInt(stockQuantity),
        categoryId
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
