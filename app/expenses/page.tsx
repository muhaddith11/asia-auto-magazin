'use client'

import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, FileText, Trash2, Banknote, Coffee, Home, Lightbulb, MoreHorizontal } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/format'
import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { toast } from 'sonner'

const categories = [
  { id: 'rent', name: 'Ijara', icon: Home },
  { id: 'salary', name: 'Oylik', icon: Banknote },
  { id: 'electricity', name: 'Kommunal', icon: Lightbulb },
  { id: 'food', name: 'Tushlik/Choy', icon: Coffee },
  { id: 'other', name: 'Boshqa', icon: MoreHorizontal },
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    category: 'other',
    description: ''
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const resp = await fetch('/api/expenses')
      const data = await resp.json()
      if (Array.isArray(data)) setExpenses(data)
    } catch (err) {
      toast.error('Yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const resp = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (resp.ok) {
        toast.success('Xarajat qo\'shildi')
        setOpen(false)
        setFormData({ amount: '', category: 'other', description: '' })
        fetchExpenses()
      }
    } catch (err) {
      toast.error('Xatolik')
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" /> Xarajatlar
          </h1>
          <p className="text-muted-foreground">Do'konning barcha chiqimlari nazorati</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Xarajat qo'shish
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Yangi xarajat</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Summa</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Kategoriya</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Izoh (Ixtiyoriy)</Label>
                <Input 
                  placeholder="Masalan: Yanvar oyi ijarasi" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full h-12 text-lg">Saqlash</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl flex justify-between items-center shadow-inner">
         <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Jami xarajatlar:</p>
            <p className="text-3xl font-black text-primary">{formatCurrency(totalExpenses)}</p>
         </div>
         <div className="bg-primary/10 p-3 rounded-full">
            <Banknote className="w-8 h-8 text-primary" />
         </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="px-6">Sana</TableHead>
              <TableHead>Kategoriya</TableHead>
              <TableHead>Izoh</TableHead>
              <TableHead className="text-right px-6">Summa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10">Yuklanmoqda...</TableCell></TableRow>
            ) : expenses.map((e) => {
              const cat = categories.find(c => c.id === e.category) || categories[4]
              return (
                <TableRow key={e.id} className="hover:bg-muted/30">
                  <TableCell className="px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{format(new Date(e.createdAt), 'dd MMMM', { locale: uz })}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(e.createdAt), 'HH:mm')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-2 px-2 py-1 font-bold">
                       <cat.icon className="w-3.5 h-3.5 text-primary" /> {cat.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground italic text-sm">{e.description || '—'}</TableCell>
                  <TableCell className="text-right px-6 font-black text-lg text-rose-600">
                    -{formatCurrency(e.amount)}
                  </TableCell>
                </TableRow>
              )
            })}
            {!loading && expenses.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">Xarajatlar hali mavjud emas</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
