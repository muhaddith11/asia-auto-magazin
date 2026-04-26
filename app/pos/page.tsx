'use client'

import React, { useState, useCallback } from 'react'
import { Cart } from '@/components/pos/Cart'
import { ProductList } from '@/components/pos/ProductList'
import { CartItem, Product } from '@/types'
import { toast } from 'sonner'

export default function POSPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])

  const addToCart = useCallback((product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product.id)
      const currentQty = existing ? existing.quantity : 0
      
      // Check stock
      if (currentQty + 1 > product.stockQuantity) {
        toast.error(`Omborda yetarli mahsulot yo'q! (Mavjud: ${product.stockQuantity})`)
        return prev
      }

      if (existing) {
        return prev.map(i => 
          i.productId === product.id 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        )
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        price: product.sellingPrice, 
        quantity: 1 
      }]
    })
  }, [])

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.productId === id) {
        const product = allProducts.find(p => p.id === id)
        const newQty = Math.max(0, item.quantity + delta)
        
        if (product && newQty > product.stockQuantity) {
          toast.error(`Omborda faqat ${product.stockQuantity} dona bor`)
          return item
        }
        
        return { ...item, quantity: newQty }
      }
      return item
    }).filter(i => i.quantity > 0))
  }

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(i => i.productId !== id))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const handleProductsLoaded = (products: Product[]) => {
    setAllProducts(products)
  }

  return (
    <main className="h-screen flex flex-col p-4 bg-muted/40 text-foreground overflow-hidden">
      <header className="flex justify-between items-center mb-4 px-2">
        <div>
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-black">POS</span>
             </div>
             MAHSULOTLAR TERMINALI
          </h1>
          <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest mt-0.5">MAGAZIN BOSHQARUV TIZIMI</p>
        </div>
        <div className="flex items-center gap-6 divide-x border bg-card/50 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sistema: Online</span>
           </div>
           <div className="flex items-center gap-2 pl-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operator:</span>
              <span className="text-xs font-black text-primary">ADMINISTRATOR</span>
           </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-hidden">
        {/* Left Side: Product browsing - Optimized for speed */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden h-full">
           <ProductList onAddToCart={addToCart} onProductsLoaded={handleProductsLoaded} />
        </div>

        {/* Right Side: Cart Interface - Linked to local products for instant barcode scan */}
        <div className="lg:col-span-2 h-full overflow-hidden">
          <Cart 
            items={cartItems} 
            products={allProducts}
            onUpdateQuantity={updateQuantity} 
            onRemoveItem={removeItem}
            onClearCart={clearCart}
            onAddToCart={addToCart}
          />
        </div>
      </div>
    </main>
  )
}
