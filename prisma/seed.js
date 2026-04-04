const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Create Categories
  const waterCategory = await prisma.category.create({
    data: { name: 'Suvlar' }
  })
  
  const snackCategory = await prisma.category.create({
    data: { name: 'Sneklar' }
  })

  const waters = [
    { name: 'Montella 0.5L', barcode: '478001', purchasePrice: 2200, sellingPrice: 3000, stockQuantity: 100, categoryId: waterCategory.id },
    { name: 'Silver 0.5L', barcode: '478002', purchasePrice: 1800, sellingPrice: 2500, stockQuantity: 120, categoryId: waterCategory.id },
    { name: 'Hydrolife 0.5L', barcode: '478003', purchasePrice: 2100, sellingPrice: 3000, stockQuantity: 80, categoryId: waterCategory.id },
    { name: 'Family 1.5L', barcode: '478004', purchasePrice: 3500, sellingPrice: 5000, stockQuantity: 50, categoryId: waterCategory.id },
    { name: 'Nestle Pure Life 0.5L', barcode: '478005', purchasePrice: 2800, sellingPrice: 4000, stockQuantity: 90, categoryId: waterCategory.id },
    { name: 'Chortoq Mineral 0.5L', barcode: '478006', purchasePrice: 4500, sellingPrice: 6500, stockQuantity: 40, categoryId: waterCategory.id },
    { name: 'Legend 0.5L', barcode: '478007', purchasePrice: 2400, sellingPrice: 3500, stockQuantity: 110, categoryId: waterCategory.id },
    { name: 'Siyob 0.5L', barcode: '478008', purchasePrice: 1600, sellingPrice: 2500, stockQuantity: 150, categoryId: waterCategory.id },
    { name: 'Bon Aqua 0.5L', barcode: '478009', purchasePrice: 3200, sellingPrice: 4500, stockQuantity: 70, categoryId: waterCategory.id },
    { name: 'Borjomi 0.5L', barcode: '478010', purchasePrice: 14000, sellingPrice: 18500, stockQuantity: 30, categoryId: waterCategory.id },
  ]

  const snacks = [
    { name: 'Lays Chips (Small)', barcode: '478011', purchasePrice: 6000, sellingPrice: 8500, stockQuantity: 60, categoryId: snackCategory.id },
    { name: 'Lays Chips (Large)', barcode: '478012', purchasePrice: 13500, sellingPrice: 18000, stockQuantity: 45, categoryId: snackCategory.id },
    { name: 'Flint Qotirilgan non', barcode: '478013', purchasePrice: 3800, sellingPrice: 5000, stockQuantity: 100, categoryId: snackCategory.id },
    { name: 'Hrusteam', barcode: '478014', purchasePrice: 4200, sellingPrice: 6000, stockQuantity: 85, categoryId: snackCategory.id },
    { name: 'Cheetos', barcode: '478015', purchasePrice: 6500, sellingPrice: 9500, stockQuantity: 70, categoryId: snackCategory.id },
    { name: 'Pringles', barcode: '478016', purchasePrice: 28000, sellingPrice: 36000, stockQuantity: 25, categoryId: snackCategory.id },
    { name: 'Doritos', barcode: '478017', purchasePrice: 11000, sellingPrice: 15000, stockQuantity: 40, categoryId: snackCategory.id },
    { name: 'Kirieshki', barcode: '478018', purchasePrice: 2800, sellingPrice: 4000, stockQuantity: 120, categoryId: snackCategory.id },
    { name: 'Slavyanskie Snack', barcode: '478019', purchasePrice: 5000, sellingPrice: 7500, stockQuantity: 55, categoryId: snackCategory.id },
    { name: 'Local Popcorn', barcode: '478020', purchasePrice: 3500, sellingPrice: 5500, stockQuantity: 100, categoryId: snackCategory.id },
  ]

  console.log('Seeding products...')
  
  for (const p of [...waters, ...snacks]) {
    await prisma.product.upsert({
      where: { barcode: p.barcode },
      update: {},
      create: p,
    })
  }

  console.log('Seeding finished!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
