import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    const { name, barcode, purchasePrice, sellingPrice, stockQuantity, categoryId } = body

    // 1. Check if barcode is taken by another product
    if (barcode) {
      const existingProduct = await prisma.product.findFirst({
        where: { 
          barcode,
          id: { not: id }
        }
      })
      if (existingProduct) {
        return NextResponse.json({ error: "Ushbu shtrix-kod boshqa mahsulotga biriktirilgan" }, { status: 400 })
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        barcode: barcode || null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
        sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : undefined,
        categoryId
      }
    })

    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Product update error:', error)
    return NextResponse.json({ error: "Mahsulotni tahrirlashda xatolik yuz berdi" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    // Check if product has sales
    const saleItems = await prisma.saleItem.count({
      where: { productId: id }
    })

    if (saleItems > 0) {
      return NextResponse.json({ 
        error: "Ushbu mahsulotni o'chirib bo'lmaydi, chunki u sotuv tarixida mavjud. Buning o'rniga sklad sonini 0 qilib qo'ying." 
      }, { status: 400 })
    }

    await prisma.product.delete({
      where: { id }
    })
    return NextResponse.json({ message: "Mahsulot o'chirildi" })
  } catch (error: any) {
    console.error('Product delete error:', error)
    return NextResponse.json({ error: "Mahsulotni o'chirishda xatolik" }, { status: 500 })
  }
}
