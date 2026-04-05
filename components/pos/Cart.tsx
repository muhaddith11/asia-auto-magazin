'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus, Minus, Search, ShoppingCart, CreditCard, Banknote, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { CartItem, Product } from '@/types'
import { toast } from 'sonner'

interface CartProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, delta: number) => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
  onAddToCartFromBarcode: (product: Product) => void
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onClearCart, onAddToCartFromBarcode }: CartProps) {
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
          setCustomers([])
        }
      })
      .catch(err => {
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
        onAddToCartFromBarcode(product)
        setBarcode('')
      } else {
        toast.error('Mahsulot topilmadi!')
        setBarcode('')
      }
    } catch (err) {
      toast.error('Xatolik yuz berdi')
    }
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
        onClearCart()
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
    <Card className="w-full h-full flex flex-col glassmorphism border-primary/20">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="w-5 h-5 text-primary" />
          Savat
          {items.length > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              {items.length} xil mahsulot
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <div className="p-4 border-b bg-muted/10">
        <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={barcodeRef}
              placeholder="Barcode skanerlang..."
              className="pl-10 h-10 border-primary/20 focus:border-primary transition-all"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" className="h-10">Qidirish</Button>
        </form>
      </div>

      <CardContent className="flex-1 overflow-auto p-0">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-[180px]">Nomi</TableHead>
              <TableHead className="text-center">Miqdor</TableHead>
              <TableHead className="text-right">Narxi</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.productId} className="hover:bg-muted/10">
                <TableCell className="font-semibold text-sm py-3 leading-tight">{item.name}</TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center justify-center gap-3 bg-muted/40 rounded-lg p-1 w-fit mx-auto border">
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-background" onClick={() => onUpdateQuantity(item.productId, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-background" onClick={() => onUpdateQuantity(item.productId, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-primary py-3">
                  {formatCurrency(item.price * item.quantity)}
                </TableCell>
                <TableCell className="py-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" onClick={() => onRemoveItem(item.productId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center py-8">
                   <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                      <ShoppingCart className="w-16 h-16" />
                      <p className="text-lg font-medium">Savat bo'sh</p>
                      <p className="text-xs">Sotish uchun mahsulotlarni tanlang</p>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex-col gap-5 border-t pt-6 bg-muted/10">
        <div className="flex w-full justify-between items-center px-2">
          <span className="text-lg text-muted-foreground font-medium">Umumiy to'lov:</span>
          <span className="text-2xl font-black text-primary drop-shadow-sm">{formatCurrency(total)}</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4 w-full">
           {paymentMethod === 'debt' && (
             <div className="animate-in fade-in slide-in-from-top-1 duration-200">
               <Select value={selectedCustomerId || ''} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger className="border-destructive/30">
                    <SelectValue placeholder="Nasiya uchun mijozni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
               </Select>
             </div>
           )}

           {paymentMethod === 'card' && (
             <Input 
                placeholder="Terminal ID / Chek raqami (ixtiyoriy)" 
                value={cardInfo} 
                onChange={(e) => setCardInfo(e.target.value)}
                className="animate-in fade-in slide-in-from-top-1 duration-200"
              />
           )}

          <div className="grid grid-cols-2 gap-4">
            <Select value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val)}>
              <SelectTrigger className="h-12 border-primary/20 font-medium">
                <SelectValue placeholder="To'lov turi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-500" /> Naqd pul
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-500" /> Plastik karta
                  </div>
                </SelectItem>
                <SelectItem value="debt">
                  <div className="flex items-center gap-2 text-destructive">
                    <Wallet className="w-4 h-4" /> Nasiya (Qarz)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              className="w-full text-lg h-12 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]" 
              disabled={items.length === 0 || isProcessing || (paymentMethod === 'debt' && !selectedCustomerId)}
              onClick={finalizeSale}
            >
              {isProcessing ? 'Yakunlanmoqda...' : 'To\'lov qilish'}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
