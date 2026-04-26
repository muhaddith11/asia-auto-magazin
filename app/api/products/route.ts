import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
  } catch (error: any) {
    console.error('Products fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch products', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, barcode, purchasePrice, sellingPrice, stockQuantity, categoryId } = body

    // Validation
    if (!name || !purchasePrice || !sellingPrice || stockQuantity === undefined) {
      return NextResponse.json({ error: "Barcha majburiy maydonlarni to'ldiring" }, { status: 400 })
    }

    const pPrice = parseFloat(purchasePrice)
    const sPrice = parseFloat(sellingPrice)
    const qty = parseInt(stockQuantity)

    if (isNaN(pPrice) || isNaN(sPrice) || isNaN(qty)) {
      return NextResponse.json({ error: "Narx yoki miqdor noto'g'ri formatda" }, { status: 400 })
    }

    if (sPrice < pPrice) {
      return NextResponse.json({ error: "Sotish narxi sotib olish narxidan kam bo'lmasligi kerak" }, { status: 400 })
    }

    // Check for duplicate barcode
    if (barcode) {
      const existing = await prisma.product.findUnique({ where: { barcode } })
      if (existing) {
        return NextResponse.json({ error: "Ushbu shtrix-kodli mahsulot allaqachon mavjud" }, { status: 400 })
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        barcode: barcode || null,
        purchasePrice: pPrice,
        sellingPrice: sPrice,
        stockQuantity: qty,
        categoryId
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('Product creation error:', error)
    return NextResponse.json({ error: "Mahsulot yaratishda xatolik yuz berdi" }, { status: 500 })
  }
}
