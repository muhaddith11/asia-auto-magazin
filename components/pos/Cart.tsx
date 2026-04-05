'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus, Minus, Search, ShoppingCart, CreditCard, Banknote, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { CartItem, Product } from '@/types'
import { toast } from 'sonner'

export function Cart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [barcode, setBarcode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'debt'>('cash')
  const [isProcessing, setIsProcessing] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [cardInfo, setCardInfo] = useState('')
  
  const barcodeRef = useRef<HTMLInputElement>(null)

  // Fetch customers
  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomers(data)
        } else {
          console.error('Invalid customers data format:', data)
          setCustomers([])
        }
      })
      .catch(err => {
        console.error('Failed to fetch customers:', err)
        setCustomers([])
      })
  }, [])

  // Auto-focus barcode input
  useEffect(() => {
    barcodeRef.current?.focus()
  }, [])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Handle Barcode Scanner
  const handleBarcodeSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!barcode) return

    try {
      const resp = await fetch(`/api/products?barcode=${barcode}`)
      const product = await resp.json()

      if (product && !product.error) {
        addToCart(product)
        setBarcode('')
      } else {
        toast.error('Mahsulot topilmadi!')
        setBarcode('')
      }
    } catch (err) {
      toast.error('Xatolik yuz berdi')
    }
  }

  const addToCart = (product: Product) => {
    setItems(prev => {
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
    setItems(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(0, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }).filter(i => i.quantity > 0))
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.productId !== id))
  }

  const finalizeSale = async () => {
    if (items.length === 0) return
    setIsProcessing(true)

    try {
      const resp = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          paymentMethod,
          totalAmount: total,
          customerId: selectedCustomerId,
          cardInfo: paymentMethod === 'card' ? cardInfo : null
        })
      })

      if (resp.ok) {
        toast.success('Savdo muvaffaqiyatli yakunlandi!')
        setItems([])
        setCardInfo('')
      } else {
        toast.error('Savdo yakunlanmadi!')
      }
    } catch (err) {
      toast.error('Tizim xatosi')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full h-full flex flex-col glassmorphism">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          Savat
        </CardTitle>
      </CardHeader>
      
      <div className="p-4 border-b">
        <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={barcodeRef}
              placeholder="Barcode skanerlang..."
              className="pl-10"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </div>
          <Button type="submit">Qidirish</Button>
        </form>
      </div>

      <CardContent className="flex-1 overflow-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomi</TableHead>
              <TableHead className="text-center">Miqdor</TableHead>
              <TableHead className="text-right">Narxi</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.productId}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Savat bo'sh
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex-col gap-4 border-t pt-6">
        <div className="flex w-full justify-between items-center text-xl font-bold">
          <span>Umumiy:</span>
          <span className="text-primary">{formatCurrency(total)}</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4 w-full">
           {paymentMethod === 'debt' && (
             <Select value={selectedCustomerId || ''} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Mijozni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
             </Select>
           )}

           {paymentMethod === 'card' && (
             <Input 
                placeholder="Terminal ID / Chek raqami" 
                value={cardInfo} 
                onChange={(e) => setCardInfo(e.target.value)}
              />
           )}

          <div className="grid grid-cols-2 gap-4">
            <Select value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val)}>
              <SelectTrigger>
                <SelectValue placeholder="To'lov turi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4" /> Naqd
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Karta
                  </div>
                </SelectItem>
                <SelectItem value="debt">
                  <div className="flex items-center gap-2 text-destructive">
                    <Wallet className="w-4 h-4" /> Nasiya
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              className="w-full text-lg h-12" 
              disabled={items.length === 0 || isProcessing || (paymentMethod === 'debt' && !selectedCustomerId)}
              onClick={finalizeSale}
            >
              {isProcessing ? 'Yozilmoqda...' : 'To\'lov qilish'}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
