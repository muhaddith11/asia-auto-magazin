'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, Package, ShoppingCart, Plus, RefreshCw } from 'lucide-react'
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
    <Card className="flex flex-col h-full glassmorphism border-primary/10 overflow-hidden">
      <CardHeader className="bg-muted/10 border-b pb-4 px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Mahsulotlar
            {!isLoading && (
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {products.length} ta jami
              </Badge>
            )}
          </CardTitle>
          
          <div className="relative w-full md:w-64 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Qidirish (Nomi, Barcode)..."
              className="pl-10 h-10 border-primary/10 transition-all focus:border-primary/40 bg-background/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 text-muted-foreground hover:rotate-180 transition-all duration-300" onClick={fetchProducts}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-6 overflow-y-auto bg-muted/5 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
             <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
             <p className="text-sm font-medium">Mahsulotlar yuklanmoqda...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40 py-12">
             <Search className="w-16 h-16 mb-2" />
             <p className="text-lg font-bold uppercase tracking-widest text-center">Hech narsa topilmadi</p>
             <p className="text-xs max-w-[200px] text-center mt-2 font-medium">Qidiruv so'rovini tekshiring yoki yangi mahsulot qo'shing</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 bg-card/60 backdrop-blur-sm cursor-pointer"
                onClick={() => onAddToCart(product)}
              >
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-300">
                   <div className="bg-primary/10 p-1.5 rounded-full text-primary border border-primary/20 backdrop-blur-md">
                      <Plus className="w-4 h-4" />
                   </div>
                </div>
                
                <CardContent className="p-4 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="font-bold text-sm leading-snug line-clamp-2 md:text-base group-hover:text-primary transition-colors mb-1">
                      {product.name}
                    </h3>
                    {product.barcode && (
                      <p className="text-[10px] text-muted-foreground font-mono mb-2 flex items-center gap-1 opacity-70">
                         {product.barcode}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-primary/5">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-primary drop-shadow-sm">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                      <Badge variant="secondary" className={`${product.stockQuantity < 10 ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/5 text-primary border-primary/10 font-bold'} text-[10px]`}>
                        {product.stockQuantity} ta
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
