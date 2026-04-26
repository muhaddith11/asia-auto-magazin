'use client'

import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Search, Wallet, History } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/format'
import { toast } from 'sonner'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [isVip, setIsVip] = useState(false)
  const [filterVip, setFilterVip] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const resp = await fetch('/api/customers')
      if (!resp.ok) {
        throw new Error('API server error')
      }
      const data = await resp.json()
      if (Array.isArray(data)) {
        setCustomers(data)
      } else {
        console.error('Invalid customers data format:', data)
        setCustomers([])
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const resp = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, isVip })
      })
      if (resp.ok) {
        toast.success('Mijoz qo\'shildi')
        setOpen(false)
        setName('')
        fetchCustomers()
      }
    } catch (err) {
      toast.error('Xatolik')
    }
  }

  const handlePayment = async (customerId: string) => {
    if (!confirm('Ushbu mijozning barcha qarzlarini to\'langan deb hisoblaymizmi?')) return
    
    try {
      const resp = await fetch(`/api/customers/${customerId}/pay`, { method: 'POST' })
      if (resp.ok) {
        toast.success('Qarzlar yopildi')
        fetchCustomers()
      } else {
        toast.error('Xatolik yuz berdi')
      }
    } catch (err) {
      toast.error('Tarmoq xatosi')
    }
  }

  const filtered = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchesVip = filterVip ? c.isVip : true
    return matchesSearch && matchesVip
  })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" /> Mijozlar
          </h1>
          <p className="text-muted-foreground">Mijozlar bazasi va qarzlar boshqaruvi</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Mijoz qo'shish
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Yangi mijoz</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cname">Ismi</Label>
                <Input id="cname" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="flex items-center space-x-2 py-2">
                <input 
                  type="checkbox" 
                  id="mvip" 
                  checked={isVip} 
                  onChange={e => setIsVip(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="mvip" className="cursor-pointer">VIP mijoz</Label>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Saqlash</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card p-4 rounded-xl border shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Mijoz qidirish..." 
            className="pl-10 h-11"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button 
          variant={filterVip ? "default" : "outline"}
          onClick={() => setFilterVip(!filterVip)}
          className="h-11 gap-2"
        >
          {filterVip ? "✓ VIP" : "VIP Mijozlar"}
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Mijoz ismi</TableHead>
              <TableHead>Umumiy qarz</TableHead>
              <TableHead>Xaridlar soni</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10">Yuklanmoqda...</TableCell></TableRow>
            ) : filtered.map((c) => {
              const totalDebt = c.debts?.reduce((acc: any, d: any) => acc + d.amount, 0) || 0
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold text-lg flex items-center gap-2">
                    {c.name}
                    {c.isVip && (
                      <Badge variant="default" className="bg-amber-500 text-white border-none text-[10px] py-0 px-1.5 h-5">VIP</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {totalDebt > 0 ? (
                      <Badge variant="destructive" className="gap-1 animate-pulse">
                        <Wallet className="w-3 h-3" /> {formatCurrency(totalDebt)}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Qarzi yo'q</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c._count?.sales || 0} ta xarid
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <History className="w-4 h-4" /> Tarix
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1" 
                      disabled={totalDebt === 0}
                      onClick={() => handlePayment(c.id)}
                    >
                       To'lov
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Mijozlar topilmadi</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
