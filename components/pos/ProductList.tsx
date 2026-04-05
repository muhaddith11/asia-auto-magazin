'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Loader2, Package, Plus, RefreshCw, Barcode } from 'lucide-react'
import { Product } from '@/types'
import { formatCurrency } from '@/lib/format'

interface ProductListProps {
  onAddToCart: (product: Product) => void
}

export function ProductList({ onAddToCart }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const resp = await fetch('/api/products')
      const data = await resp.json()
      if (Array.isArray(data)) {
        setProducts(data)
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchTerm))
  )

  return (
    <Card className="flex flex-col h-full glassmorphism border-primary/10 overflow-hidden shadow-none">
      <CardHeader className="bg-muted/10 border-b pb-4 px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Mahsulotlar
            {!isLoading && (
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {products.length} ta
              </Badge>
            )}
          </CardTitle>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Shtrix-kod yoki nomi bo'yicha qidirish..."
              className="pl-10 h-10 border-primary/10 transition-all focus:border-primary/40 bg-background/50 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10 text-muted-foreground hover:rotate-180 transition-all duration-300" onClick={fetchProducts}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col bg-muted/5">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
             <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
             <p className="text-sm font-medium">Mahsulotlar yuklanmoqda...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-40 py-12">
             <Search className="w-16 h-16 mb-2" />
             <p className="text-lg font-bold uppercase tracking-widest text-center">Hech narsa topilmadi</p>
             <p className="text-xs max-w-[200px] text-center mt-2 font-medium">Qidiruv so'rovini tekshiring yoki yangi mahsulot qo'shing</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0 z-20">
                <TableRow className="hover:bg-transparent border-primary/10">
                  <TableHead className="w-[80px]">Shtrix-kod</TableHead>
                  <TableHead>Mahsulot nomi</TableHead>
                  <TableHead className="text-right">Narxi</TableHead>
                  <TableHead className="text-center w-[100px]">Qoldiq</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id} 
                    className="group border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer"
                    onClick={() => onAddToCart(product)}
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground opacity-70">
                        <Barcode className="w-3 h-3" />
                        {product.barcode || '---'}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <span className="font-black text-primary text-sm">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge variant="outline" className={`${product.stockQuantity < 10 ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/5 text-primary border-primary/10 font-bold'} text-[10px] h-5 px-1.5`}>
                        {product.stockQuantity} ta
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                       <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                          <Plus className="w-4 h-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
