import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3, Settings, History } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

export default function Dashboard() {
  const cards = [
    { title: 'POS Terminal', desc: 'Savdo operatsiyalarini amalga oshirish', icon: ShoppingCart, href: '/pos', color: 'bg-primary/10 text-primary' },
    { title: 'Inventar', desc: 'Mahsulotlar va ombor qoldig\'i boshqaruvi', icon: Package, href: '/inventory', color: 'bg-green-500/10 text-green-500' },
    { title: 'Savdo Tarixi', desc: 'Kunlik va oylik daromad hisobotlari', icon: History, href: '/sales', color: 'bg-orange-500/10 text-orange-500' },
    { title: 'Mijozlar', desc: 'Mijozlar bazasi va qarzlar boshqaruvi', icon: Users, href: '/customers', color: 'bg-blue-500/10 text-blue-500' },
    { title: 'Tizim', desc: 'Xodimlar va umumiy sozlamalar', icon: Settings, href: '/settings', color: 'bg-purple-500/10 text-purple-500' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Magazin Boshqaruvi</h1>
          <p className="text-muted-foreground text-lg">Asosiy menyu va ko'rsatkichlar</p>
        </div>
        <ModeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="group-hover:text-primary transition-colors">{card.title}</CardTitle>
                  <CardDescription>{card.desc}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Bugungi Savdo</span>
              <span className="text-sm font-normal text-muted-foreground">Oxirgi 24 soat</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-primary">0 UZS</div>
            <p className="text-xs text-muted-foreground mt-1">Savdolar soni: 0</p>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Kam qolgan mahsulotlar</span>
              <span className="text-sm font-normal text-muted-foreground">Stock &lt; 10</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-orange-500">0</div>
            <p className="text-xs text-muted-foreground mt-1">Ko'rib chiqish tavsiya etiladi</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
