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
    return NextResponse.json({ error: "Mahsulotni tahrirlashda xatolik" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    await prisma.product.delete({
      where: { id }
    })
    return NextResponse.json({ message: "Mahsulot o'chirildi" })
  } catch (error: any) {
    console.error('Product delete error:', error)
    return NextResponse.json({ error: "Mahsulotni o'chirishda xatolik" }, { status: 500 })
  }
}
