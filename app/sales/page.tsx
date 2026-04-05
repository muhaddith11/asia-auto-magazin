'use client'

import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { History, ShoppingCart, CreditCard, Banknote, Calendar, Wallet, TrendingUp, ReceiptText } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { format, isToday, startOfDay, endOfDay } from 'date-fns'
import { uz } from 'date-fns/locale'

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      const resp = await fetch('/api/sales')
      if (!resp.ok) {
        throw new Error('API server error')
      }
      const data = await resp.json()
      if (Array.isArray(data)) {
        setSales(data)
      } else {
        setSales([])
      }
    } catch (err) {
      setSales([])
    } finally {
      setLoading(false)
    }
  }

  // Stats for today
  const todaySales = sales.filter(s => isToday(new Date(s.createdAt)))
  const todayCash = todaySales.filter(s => s.paymentMethod === 'cash').reduce((acc, s) => acc + s.totalAmount, 0)
  const todayCard = todaySales.filter(s => s.paymentMethod === 'card').reduce((acc, s) => acc + s.totalAmount, 0)
  const todayDebt = todaySales.filter(s => s.paymentMethod === 'debt').reduce((acc, s) => acc + s.totalAmount, 0)
  const todayTotal = todayCash + todayCard + todayDebt

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
               <History className="w-8 h-8 text-primary" />
            </div>
            Savdo Tarixi va Hisobot
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Barcha amalga oshirilgan savdolar va tushumlar nazorati</p>
        </div>
        <div className="flex bg-muted/30 p-1 rounded-xl border">
           <Badge variant="ghost" className="px-3 py-1 font-bold text-xs uppercase tracking-wider text-muted-foreground">Bugungi holat</Badge>
        </div>
      </div>

      {/* Today's Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glassmorphism border-primary/10 shadow-lg shadow-primary/5 transition-all hover:scale-[1.02]">
          <CardHeader className="pb-2 space-y-1">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
               <ReceiptText className="w-3 h-3 text-primary" />
               Bugungi Jami
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">
               {formatCurrency(todayTotal)}
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-emerald-500/10 shadow-lg shadow-emerald-500/5 transition-all hover:scale-[1.02]">
          <CardHeader className="pb-2 space-y-1">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
               <Banknote className="w-4 h-4 text-emerald-500" />
               Naqd pul (Kassa)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600">
               {formatCurrency(todayCash)}
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-blue-500/10 shadow-lg shadow-blue-500/5 transition-all hover:scale-[1.02]">
          <CardHeader className="pb-2 space-y-1">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
               <CreditCard className="w-4 h-4 text-blue-500" />
               Karta (Terminal)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-600">
               {formatCurrency(todayCard)}
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-rose-500/10 shadow-lg shadow-rose-500/5 transition-all hover:scale-[1.02]">
          <CardHeader className="pb-2 space-y-1">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
               <Wallet className="w-4 h-4 text-rose-500" />
               Nasiya (Qarz)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-600">
               {formatCurrency(todayDebt)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats Summary for All time */}
      <div className="bg-muted/20 p-4 rounded-2xl flex flex-wrap items-center gap-8 border border-primary/5">
         <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
               <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase">Umumiy Savdolar</p>
               <p className="text-lg font-black">{sales.length} ta</p>
            </div>
         </div>
         <div className="w-px h-10 bg-primary/10 hidden sm:block"></div>
         <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
               <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase">Jami Tushum</p>
               <p className="text-lg font-black text-primary">{formatCurrency(sales.reduce((acc, sale) => acc + sale.totalAmount, 0))}</p>
            </div>
         </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-xl overflow-hidden glassmorphism">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-primary/10">
              <TableHead className="py-4 px-6 text-xs uppercase font-black text-muted-foreground tracking-widest">Savdo vaqti</TableHead>
              <TableHead className="py-4 px-6 text-xs uppercase font-black text-muted-foreground tracking-widest">ID / QR</TableHead>
              <TableHead className="py-4 px-6 text-xs uppercase font-black text-muted-foreground tracking-widest">To'lov shakli</TableHead>
              <TableHead className="py-4 px-6 text-xs uppercase font-black text-muted-foreground tracking-widest text-center">Miqdor</TableHead>
              <TableHead className="py-4 px-6 text-right text-xs uppercase font-black text-muted-foreground tracking-widest">Summa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20">Yuklanmoqda...</TableCell></TableRow>
            ) : sales.map((sale) => (
              <TableRow key={sale.id} className={`border-primary/5 hover:bg-primary/5 transition-colors ${isToday(new Date(sale.createdAt)) ? 'bg-primary/[0.02]' : ''}`}>
                <TableCell className="py-4 px-6 font-bold flex items-center gap-3">
                  <div className="bg-muted p-1.5 rounded-lg border border-primary/5">
                     <Calendar className="w-4 h-4 text-primary/60" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-sm">{format(new Date(sale.createdAt), 'dd MMMM', { locale: uz })}</span>
                     <span className="text-xs text-muted-foreground font-medium">{format(new Date(sale.createdAt), 'HH:mm')}</span>
                  </div>
                  {isToday(new Date(sale.createdAt)) && (
                     <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] h-4 font-black">BUGUN</Badge>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6">
                   <code className="text-xs font-mono text-muted-foreground bg-muted p-1 rounded">
                      #{sale.id.slice(-6).toUpperCase()}
                   </code>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className={`gap-1.5 w-fit font-bold border-muted-foreground/20 px-2 py-1 ${
                      sale.paymentMethod === 'cash' ? 'text-emerald-600 bg-emerald-50/50' : 
                      sale.paymentMethod === 'card' ? 'text-blue-600 bg-blue-50/50' : 
                      'text-rose-600 bg-rose-50/50'
                    }`}>
                      {sale.paymentMethod === 'cash' ? (
                        <><Banknote className="w-3.5 h-3.5" /> Naqd</>
                      ) : sale.paymentMethod === 'card' ? (
                        <><CreditCard className="w-3.5 h-3.5" /> Karta</>
                      ) : (
                        <><Wallet className="w-3.5 h-3.5" /> Nasiya</>
                      )}
                    </Badge>
                    {sale.cardInfo && (
                      <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                        <TrendingUp className="w-2.5 h-2.5" /> Terminal ID: {sale.cardInfo}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6 text-center">
                  <div className="inline-flex flex-col items-center">
                    <span className="font-bold text-sm">{sale.items.length} xil</span>
                    <span className="text-[10px] font-medium text-muted-foreground">({sale.items.reduce((acc: any, i: any) => acc + i.quantity, 0)} dona)</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <span className="text-xl font-black text-primary tracking-tight">
                    {formatCurrency(sale.totalAmount)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {!loading && sales.length === 0 && (
              <TableRow>
                 <TableCell colSpan={5} className="text-center py-20 opacity-30">
                    <History className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-bold">Savdolar topilmadi</p>
                 </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
