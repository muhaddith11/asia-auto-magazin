'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ShoppingCart, Package, Users, Settings, History, FileText, Banknote, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

export default function Dashboard() {
  const [stats, setStats] = useState({
    todayTotal: 0,
    todayProfit: 0,
    todaySalesCount: 0,
    lowStockCount: 0,
    customersCount: 0,
    totalDebt: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setStats(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { title: 'POS Terminal', desc: 'Savdo qilish', icon: ShoppingCart, href: '/pos', color: 'bg-primary/10 text-primary' },
    { title: 'Inventar', desc: 'Mahsulotlar boshqaruvi', icon: Package, href: '/inventory', color: 'bg-emerald-500/10 text-emerald-500' },
    { title: 'Savdo Tarixi', desc: 'Hisobotlar', icon: History, href: '/sales', color: 'bg-orange-500/10 text-orange-500' },
    { title: 'Xarajatlar', desc: 'Chiqimlar nazorati', icon: FileText, href: '/expenses', color: 'bg-rose-500/10 text-rose-500' },
    { title: 'Mijozlar', desc: 'Qarzlar va VIP baza', icon: Users, href: '/customers', color: 'bg-blue-500/10 text-blue-500' },
    { title: 'Sozlamalar', desc: 'Tizim parametrlari', icon: Settings, href: '/settings', color: 'bg-purple-500/10 text-purple-500' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Boshqaruv Paneli</h1>
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Do'kon holati va asosiy ko'rsatkichlar</p>
      </div>

      {/* Real-time Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <Card className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20">
            <CardContent className="p-6">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold uppercase opacity-70 tracking-widest">Bugun Jami Savdo</p>
                     <h3 className="text-2xl font-black mt-1">{formatCurrency(stats.todayTotal)}</h3>
                  </div>
                  <Banknote className="w-8 h-8 opacity-40" />
               </div>
               <p className="text-[10px] font-bold mt-4 uppercase opacity-50">{stats.todaySalesCount} ta chek urildi</p>
            </CardContent>
         </Card>

         <Card className="bg-emerald-600 text-white border-none shadow-xl shadow-emerald-600/20">
            <CardContent className="p-6">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold uppercase opacity-70 tracking-widest">Bugun Sof Foyda</p>
                     <h3 className="text-2xl font-black mt-1">{formatCurrency(stats.todayProfit)}</h3>
                  </div>
                  <TrendingUp className="w-8 h-8 opacity-40" />
               </div>
               <p className="text-[10px] font-bold mt-4 uppercase opacity-50">Real vaqt rejimida</p>
            </CardContent>
         </Card>

         <Card className="bg-rose-600 text-white border-none shadow-xl shadow-rose-600/20">
            <CardContent className="p-6">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold uppercase opacity-70 tracking-widest">Mijozlar Qarzi</p>
                     <h3 className="text-2xl font-black mt-1">{formatCurrency(stats.totalDebt)}</h3>
                  </div>
                  <Users className="w-8 h-8 opacity-40" />
               </div>
               <p className="text-[10px] font-bold mt-4 uppercase opacity-50">Jami nasiyalar</p>
            </CardContent>
         </Card>

         <Card className={`border-none shadow-xl ${stats.lowStockCount > 0 ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-muted text-muted-foreground'}`}>
            <CardContent className="p-6">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold uppercase opacity-70 tracking-widest">Kam qolganlar</p>
                     <h3 className="text-2xl font-black mt-1">{stats.lowStockCount} ta</h3>
                  </div>
                  <AlertTriangle className="w-8 h-8 opacity-40" />
               </div>
               <p className="text-[10px] font-bold mt-4 uppercase opacity-50">Tavsiya etiladi</p>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="group">
            <Card className="border-primary/5 hover:border-primary/20 hover:shadow-2xl transition-all duration-300 h-full overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 group-hover:opacity-20 transition-opacity -mr-4 -mt-4`}>
                 <card.icon className="w-full h-full" />
              </div>
              <CardHeader className="p-4 pb-2">
                <div className={`p-2.5 rounded-xl w-fit mb-2 ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-sm font-black tracking-tighter uppercase">{card.title}</CardTitle>
                <CardDescription className="text-[10px] leading-tight line-clamp-1">{card.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
