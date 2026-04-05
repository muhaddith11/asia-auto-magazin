'use client'

import React, { useState } from 'react'
import { Cart } from '@/components/pos/Cart'
import { ProductList } from '@/components/pos/ProductList'
import { CartItem, Product } from '@/types'

export default function POSPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product.id)
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
  }

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(0, item.quantity + delta)
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

  return (
    <main className="h-screen flex flex-col p-4 bg-muted/30">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Magazin Terminal (POS)</h1>
          <p className="text-sm text-muted-foreground">Tezkor savdo tizimi</p>
        </div>
        <div className="flex items-center gap-4 bg-card border px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm text-muted-foreground font-medium">Sotuvchi:</span>
          <span className="text-sm font-bold">Administrator</span>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-hidden">
        {/* Left Side: Product browsing - Grid of products */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden h-full">
           <ProductList onAddToCart={addToCart} />
        </div>

        {/* Right Side: Cart Interface */}
        <div className="lg:col-span-2 h-full overflow-hidden">
          <Cart 
            items={cartItems} 
            onUpdateQuantity={updateQuantity} 
            onRemoveItem={removeItem}
            onClearCart={clearCart}
            onAddToCartFromBarcode={addToCart}
          />
        </div>
      </div>
    </main>
  )
}
