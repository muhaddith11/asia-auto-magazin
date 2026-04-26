'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Settings, Store, Users, FileText, Lock, Save, Send } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [store, setStore] = useState({
    name: '',
    phone: '',
    address: '',
    receiptFooter: '',
    telegramToken: '',
    telegramChatId: ''
  })

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setStore(prev => ({ ...prev, ...data }))
        }
      })
      .catch(err => console.error('Failed to fetch settings:', err))
  }, [])

  const saveSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(store)
      })
      if (res.ok) toast.success('Sozlamalar saqlandi')
    } catch (e) {
      toast.error('Xatolik')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8 text-primary" /> Sozlamalar
        </h1>
        <p className="text-muted-foreground">Tizim va do'kon parametrlarini boshqarish</p>
      </header>

      <div className="grid gap-6">
        {/* Do'kon Ma'lumotlari */}
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" /> Do'kon ma'lumotlari
            </CardTitle>
            <CardDescription>Chek va xabarlarda ko'rinadigan ma'lumotlar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Do'kon nomi</Label>
                <Input value={store.name} onChange={e => setStore({...store, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input value={store.phone || ''} onChange={e => setStore({...store, phone: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Manzil</Label>
              <Input value={store.address || ''} onChange={e => setStore({...store, address: e.target.value})} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveSettings} disabled={loading} className="gap-2">
              <Save className="w-4 h-4" /> Saqlash
            </Button>
          </CardFooter>
        </Card>

        {/* Chek Sozlamalari */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> Chek sozlamalari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Chek ostidagi matn (Footer)</Label>
              <Input value={store.receiptFooter || ''} onChange={e => setStore({...store, receiptFooter: e.target.value})} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveSettings} disabled={loading}>Saqlash</Button>
          </CardFooter>
        </Card>

        {/* Telegram Integratsiyasi */}
        <Card className="border-blue-500/20 shadow-lg shadow-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Send className="w-5 h-5" /> Telegram xabarnomalar
            </CardTitle>
            <CardDescription>Sotuvlar va hisobotlarni Telegram orqali olish</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bot Token (@BotFather orqali olingan)</Label>
              <Input 
                type="password"
                placeholder="123456789:ABCDefgh..." 
                value={store.telegramToken || ''} 
                onChange={e => setStore({...store, telegramToken: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Chat ID (Sizning ID raqamingiz)</Label>
              <Input 
                placeholder="12345678" 
                value={store.telegramChatId || ''} 
                onChange={e => setStore({...store, telegramChatId: e.target.value})} 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveSettings} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              Sozlamalarni saqlash
            </Button>
          </CardFooter>
        </Card>

        {/* Xodimlar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Xodimlar
            </CardTitle>
            <CardDescription>Tizimdan foydalanuvchilar ro'yxati</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border-dashed border-2">
               Xodimlar qo'shish funksiyasi keyingi yangilanishda...
            </div>
          </CardContent>
        </Card>

        {/* Xavfsizlik */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" /> Xavfsizlik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Admin parolini o'zgartirish</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
