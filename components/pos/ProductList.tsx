'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  onProductsLoaded: (products: Product[]) => void
}

export function ProductList({ onAddToCart, onProductsLoaded }: ProductListProps) {
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
        onProductsLoaded(data)
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

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products
    const term = searchTerm.toLowerCase()
    return products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      (p.barcode && p.barcode.includes(term))
    )
  }, [products, searchTerm])

  return (
    <Card className="flex flex-col h-full bg-card/60 backdrop-blur-sm border-primary/10 overflow-hidden shadow-none rounded-2xl">
      <CardHeader className="bg-muted/10 border-b pb-4 px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-xl flex items-center gap-3">
             <div className="bg-primary/20 p-2 rounded-xl">
                <Package className="w-5 h-5 text-primary" />
             </div>
            Mahsulotlar
            {!isLoading && (
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-2.5 py-0.5">
                {products.length} ta
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Nomi orqali yoki barcode skanerlang..."
                className="pl-10 h-11 border-primary/10 transition-all focus:border-primary/40 focus:ring-1 focus:ring-primary/20 bg-background/50 text-sm rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            
            <Button variant="ghost" size="icon" className="shrink-0 h-11 w-11 text-muted-foreground hover:rotate-180 transition-all duration-500 bg-muted/30 rounded-xl" onClick={fetchProducts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4 bg-muted/5 opacity-60">
             <Loader2 className="w-12 h-12 animate-spin text-primary" />
             <p className="text-sm font-bold uppercase tracking-wider animate-pulse">Ma'lumotlar o'qilmoqda...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-30 py-12">
             <Search className="w-20 h-20 mb-4" />
             <p className="text-2xl font-black uppercase tracking-tighter text-center italic">Hech narsa topilmadi</p>
             <p className="text-xs font-bold mt-2">Qidiruv kriteriyasini tekshiring</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-20 backdrop-blur-md">
                <TableRow className="hover:bg-transparent border-primary/10 h-12">
                  <TableHead className="w-[120px] font-black text-[10px] uppercase tracking-widest text-muted-foreground px-6 text-center">Barcode</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground px-6">Mahsulot nomi</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground px-6">Narxi</TableHead>
                  <TableHead className="text-center w-[120px] font-black text-[10px] uppercase tracking-widest text-muted-foreground px-6">Sklad</TableHead>
                  <TableHead className="w-[80px] px-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id} 
                    className="group border-primary/5 hover:bg-primary/[0.03] transition-all cursor-pointer h-14"
                    onClick={() => onAddToCart(product)}
                  >
                    <TableCell className="px-6 py-0">
                      <div className="flex items-center justify-center">
                        {product.barcode ? (
                           <Badge variant="outline" className="font-mono text-[9px] h-5 px-1.5 border-primary/10 bg-primary/5 text-muted-foreground group-hover:text-primary transition-colors">
                              {product.barcode}
                           </Badge>
                        ) : (
                           <span className="text-muted-foreground/30 font-bold">---</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-0">
                      <div className="font-black text-sm tracking-tight text-foreground/80 group-hover:text-primary transition-all flex items-center gap-2">
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-0 text-right">
                      <span className="font-black text-primary text-base drop-shadow-sm">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-0 text-center">
                      <div className="inline-flex flex-col">
                        <span className={`text-xs font-black ${product.stockQuantity < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                           {product.stockQuantity} dona
                        </span>
                        <div className={`w-full h-1 mt-1 rounded-full bg-muted overflow-hidden`}>
                           <div className={`h-full ${product.stockQuantity < 10 ? 'bg-destructive' : 'bg-primary/40'}`} style={{ width: `${Math.min(100, product.stockQuantity)}%` }}></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-0 text-right">
                       <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-primary/5 text-primary opacity-20 group-hover:opacity-100 group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-primary/20">
                          <Plus className="w-5 h-5 font-black" />
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
