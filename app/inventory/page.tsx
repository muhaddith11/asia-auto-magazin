'use client'

import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit2, Package, Barcode } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useDebounce } from 'use-debounce'
import { formatCurrency } from '@/lib/format'
import { Product } from '@/types'
import { toast } from 'sonner'

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    purchasePrice: '',
    sellingPrice: '',
    stockQuantity: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [debouncedSearch])

  const fetchProducts = async () => {
    try {
      const resp = await fetch(`/api/products?q=${debouncedSearch}`)
      if (!resp.ok) {
        throw new Error('API server error')
      }
      const data = await resp.json()
      if (Array.isArray(data)) {
        setProducts(data)
      } else {
        console.error('Invalid products data format:', data)
        setProducts([])
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
      toast.error('Mahsulotlarni yuklashda xatolik yuz berdi')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const resp = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (resp.ok) {
        toast.success('Mahsulot muvaffaqiyatli qo\'shildi')
        setOpen(false)
        fetchProducts()
        setFormData({ name: '', barcode: '', purchasePrice: '', sellingPrice: '', stockQuantity: '' })
      }
    } catch (err) {
      toast.error('Xatolik yuz berdi')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8 text-primary" /> Inventar
          </h1>
          <p className="text-muted-foreground">Ombordagi mavjud mahsulotlar boshqaruvi</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Mahsulot qo'shish
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yangi mahsulot</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nomi</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Shtrix-kod</Label>
                <Input 
                  id="barcode" 
                  value={formData.barcode} 
                  onChange={e => setFormData({...formData, barcode: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Soni</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    value={formData.stockQuantity} 
                    onChange={e => setFormData({...formData, stockQuantity: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase">Sotib olingan</Label>
                  <Input 
                    id="purchase" 
                    type="number" 
                    value={formData.purchasePrice} 
                    onChange={e => setFormData({...formData, purchasePrice: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selling">Sotish narxi</Label>
                  <Input 
                    id="selling" 
                    type="number" 
                    value={formData.sellingPrice} 
                    onChange={e => setFormData({...formData, sellingPrice: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Saqlash</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Nomi yoki shtrix-kod bo'yicha qidirish..." 
            className="pl-10 h-11"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">Barcode</TableHead>
              <TableHead>Nomi</TableHead>
              <TableHead>Soni</TableHead>
              <TableHead>Kirim narxi</TableHead>
              <TableHead>Sotuv narxi</TableHead>
              <TableHead>Kiritildi</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10">Yuklanmoqda...</TableCell></TableRow>
            ) : products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Badge variant="outline" className="gap-1">
                    <Barcode className="w-3 h-3" /> {product.barcode || '—'}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <span className={product.stockQuantity < 10 ? 'text-destructive font-bold' : ''}>
                    {product.stockQuantity}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatCurrency(product.purchasePrice)}</TableCell>
                <TableCell className="font-semibold text-primary">{formatCurrency(product.sellingPrice)}</TableCell>
                <TableCell className="text-xs text-muted-foreground italic">
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && products.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Mahsulotlar topilmadi</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
