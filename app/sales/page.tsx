'use client'

import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { History, ShoppingCart, CreditCard, Banknote, Calendar, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { format } from 'date-fns'
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
        console.error('Invalid sales data format:', data)
        setSales([])
      }
    } catch (err) {
      console.error('Failed to fetch sales:', err)
      setSales([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="w-8 h-8 text-primary" /> Savdo Tarixi
          </h1>
          <p className="text-muted-foreground">Barcha amalga oshirilgan savdolar ro'yxati</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glassmorphism">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jami Savdolar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length} ta</div>
          </CardContent>
        </Card>
        <Card className="glassmorphism">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jami Summa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(sales.reduce((acc, sale) => acc + sale.totalAmount, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Vaqt</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>To'lov turi</TableHead>
              <TableHead>Mahsulotlar</TableHead>
              <TableHead className="text-right">Umumiy summa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Yuklanmoqda...</TableCell></TableRow>
            ) : sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  {format(new Date(sale.createdAt), 'dd MMM, HH:mm', { locale: uz })}
                </TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground truncate w-24">
                  #{sale.id.slice(-6)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="gap-1 w-fit">
                      {sale.paymentMethod === 'cash' ? (
                        <><Banknote className="w-3 h-3" /> Naqd</>
                      ) : sale.paymentMethod === 'card' ? (
                        <><CreditCard className="w-3 h-3" /> Karta</>
                      ) : (
                        <><Wallet className="w-3 h-3" /> Nasiya</>
                      )}
                    </Badge>
                    {sale.cardInfo && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Terminal: {sale.cardInfo}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground">
                    {sale.items.length} turdagi ({sale.items.reduce((acc: any, i: any) => acc + i.quantity, 0)} dona)
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-lg">
                  {formatCurrency(sale.totalAmount)}
                </TableCell>
              </TableRow>
            ))}
            {!loading && sales.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Savdolar topilmadi</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
