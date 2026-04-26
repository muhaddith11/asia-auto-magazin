'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Trash2, Plus, Minus, Search, ShoppingCart, CreditCard, Banknote, Wallet, ReceiptText, ChevronRight, Loader2, Printer, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { CartItem, Product } from '@/types'
import { Receipt } from './Receipt'
import { toast } from 'sonner'

interface CartProps {
  items: CartItem[]
  products: Product[]
  onUpdateQuantity: (id: string, delta: number) => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
  onAddToCart: (product: Product) => void
}

export function Cart({ items, products, onUpdateQuantity, onRemoveItem, onClearCart, onAddToCart }: CartProps) {
  const [barcode, setBarcode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'debt'>('cash')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [lastSaleId, setLastSaleId] = useState('')
  const [storeSettings, setStoreSettings] = useState<any>(null)
  const [receiptData, setReceiptData] = useState<any>(null)
  
  const barcodeRef = useRef<HTMLInputElement>(null)

  // Fetch settings for receipt
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setStoreSettings(data)
      })
  }, [])

  // Fetch customers
  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data)
      })
      .catch(() => {})
  }, [])

  // Auto-focus barcode input
  useEffect(() => {
    barcodeRef.current?.focus()
  }, [])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // HANDLE ZERO LATENCY SCANNING
  const handleBarcodeSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    if (!barcode) return

    // Search locally instead of API call
    const product = products.find(p => p.barcode === barcode)

    if (product) {
      onAddToCart(product)
      setBarcode('')
      toast.success(`${product.name} qo'shildi`, { duration: 1000 })
    } else {
      toast.error('Mahsulot topilmadi!')
      setBarcode('')
    }
  }, [barcode, products, onAddToCart])

  const finalizeSale = async () => {
    if (items.length === 0) return
    setIsProcessing(true)

    const saleData = {
      items: [...items],
      paymentMethod,
      totalAmount: total,
      customerId: selectedCustomerId,
      cardInfo: paymentMethod === 'card' ? cardInfo : null
    }

    try {
      const resp = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      })

      const data = await resp.json()

      if (resp.ok) {
        setReceiptData({ ...saleData, saleId: data.id })
        setLastSaleId(data.id)
        setIsSuccessOpen(true)
        onClearCart()
        setCardInfo('')
        setSelectedCustomerId(null)
      } else {
        toast.error(`Savdo yakunlanmadi: ${data.error || "Noma'lum xato"}`)
      }
    } catch (err) {
      toast.error('Tizim xatosi')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Card className="w-full h-full flex flex-col bg-card/60 backdrop-blur-xl border-primary/20 shadow-2xl rounded-2xl overflow-hidden">
      <CardHeader className="bg-primary/5 border-b pb-4 pt-6 px-6">
        <CardTitle className="flex items-center gap-3 text-lg font-black tracking-tighter">
          <div className="bg-primary p-2 rounded-xl text-white">
             <ShoppingCart className="w-5 h-5" />
          </div>
          SAVAT
          {items.length > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full font-black">
              {items.length} xil mahsulot
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <div className="p-4 border-b bg-muted/20">
        <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={barcodeRef}
              placeholder="Barcode skanerlang..."
              className="pl-10 h-11 border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl bg-background"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </div>
          <Button type="submit" variant="default" className="h-11 rounded-xl">Topish</Button>
        </form>
      </div>

      <CardContent className="flex-1 overflow-auto p-0 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
        <Table>
          <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur-md border-b">
            <TableRow className="border-none hover:bg-transparent h-10">
              <TableHead className="px-6 font-black text-[9px] uppercase tracking-widest text-muted-foreground">Nomi</TableHead>
              <TableHead className="text-center font-black text-[9px] uppercase tracking-widest text-muted-foreground">Miqdor</TableHead>
              <TableHead className="text-right px-6 font-black text-[9px] uppercase tracking-widest text-muted-foreground">Summa</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.productId} className="hover:bg-primary/[0.02] border-primary/5 transition-all h-16 group">
                <TableCell className="px-6 font-black text-xs leading-none">
                  {item.name}
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center justify-center gap-3 bg-muted/40 rounded-xl p-1 w-fit mx-auto border border-primary/10">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onUpdateQuantity(item.productId, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-black text-xs">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onUpdateQuantity(item.productId, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right font-black text-primary px-6 text-sm">
                  {formatCurrency(item.price * item.quantity)}
                </TableCell>
                <TableCell className="px-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all rounded-lg" onClick={() => onRemoveItem(item.productId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center py-8">
                   <div className="flex flex-col items-center justify-center gap-4 opacity-30 select-none">
                      <div className="bg-muted p-6 rounded-full border border-dashed border-primary/20">
                         <ShoppingCart className="w-16 h-16 text-primary/40" />
                      </div>
                      <p className="text-lg font-black tracking-tighter uppercase italic">Savat bo'sh</p>
                      <p className="text-xs font-bold -mt-2">Sotish uchun mahsulotlarni tanlang</p>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex-col gap-6 border-t pt-6 px-6 pb-6 bg-primary/[0.02]">
        <div className="flex w-full justify-between items-end border-b border-primary/10 pb-4">
          <div className="flex flex-col">
             <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Umumiy to'lov:</span>
             <span className="text-2xl font-black text-primary drop-shadow-sm leading-none mt-1">{formatCurrency(total)}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Elementlar:</span>
             <span className="text-lg font-black leading-none mt-1">{items.reduce((a,c) => a + c.quantity, 0)} dona</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 w-full">
           <div className="flex flex-wrap gap-2">
              <Button 
                variant={paymentMethod === 'cash' ? 'default' : 'outline'} 
                className="flex-1 rounded-xl h-12 font-black text-xs gap-2" 
                onClick={() => setPaymentMethod('cash')}
              >
                 <Banknote className="w-4 h-4" /> NAQD PUL
              </Button>
              <Button 
                variant={paymentMethod === 'card' ? 'default' : 'outline'} 
                className="flex-1 rounded-xl h-12 font-black text-xs gap-2" 
                onClick={() => setPaymentMethod('card')}
              >
                 <CreditCard className="w-4 h-4" /> PLASTIK
              </Button>
              <Button 
                variant={paymentMethod === 'debt' ? 'default' : 'outline'} 
                className={`flex-1 rounded-xl h-12 font-black text-xs gap-2 ${paymentMethod === 'debt' ? 'bg-rose-600 hover:bg-rose-700' : ''}`} 
                onClick={() => setPaymentMethod('debt')}
              >
                 <Wallet className="w-4 h-4" /> NASIYA
              </Button>
           </div>

           {paymentMethod === 'debt' && (
             <Select value={selectedCustomerId || ''} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="h-12 rounded-xl border-rose-500/20 font-bold bg-rose-50/10">
                  <SelectValue placeholder="Mijozni tanlang" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id} className="font-bold text-xs">{c.name}</SelectItem>
                  ))}
                </SelectContent>
             </Select>
           )}

           {paymentMethod === 'card' && (
             <Input 
                placeholder="Terminal ID / Chek raqami" 
                value={cardInfo} 
                onChange={(e) => setCardInfo(e.target.value)}
                className="h-12 rounded-xl border-blue-500/20 font-bold bg-blue-50/10"
              />
           )}

          <Button 
            className="w-full text-lg h-16 font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98] gap-3" 
            disabled={items.length === 0 || isProcessing || (paymentMethod === 'debt' && !selectedCustomerId)}
            onClick={finalizeSale}
          >
            {isProcessing ? (
               <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
               <><ReceiptText className="w-6 h-6" /> TO'LOV QILISH <ChevronRight className="w-5 h-5 ml-auto opacity-40" /></>
            )}
          </Button>
        </div>
      </CardFooter>

      {/* Success & Print Modal */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none bg-transparent shadow-none">
          <div className="bg-white rounded-3xl overflow-hidden">
             <div className="bg-primary p-6 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                   <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">Savdo yakunlandi!</h3>
                <p className="text-white/70 text-sm font-medium">To'lov muvaffaqiyatli qabul qilindi</p>
             </div>
             
             <div className="p-6 bg-muted/30">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-primary/5 max-h-[400px] overflow-auto">
                   {receiptData && (
                     <Receipt 
                        items={receiptData.items}
                        total={receiptData.totalAmount}
                        paymentMethod={receiptData.paymentMethod}
                        saleId={receiptData.saleId}
                        storeSettings={storeSettings}
                     />
                   )}
                </div>
             </div>

             <div className="p-6 bg-white flex flex-col gap-3">
                <Button onClick={handlePrint} className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-primary/20 transition-transform active:scale-95">
                   <Printer className="w-6 h-6" /> CHEK CHIQARISH
                </Button>
                <Button variant="ghost" onClick={() => setIsSuccessOpen(false)} className="w-full h-12 rounded-xl font-bold text-muted-foreground">
                   YOPISH
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
