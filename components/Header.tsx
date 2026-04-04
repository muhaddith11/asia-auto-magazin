'use client'

import React from 'react'
import Link from 'next/link'
import { ModeToggle } from './mode-toggle'
import { Store, ShoppingCart, Package, Users, History, Home, Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  
  const nav = [
    { name: 'POS', href: '/pos', icon: ShoppingCart },
    { name: 'Inventar', href: '/inventory', icon: Package },
    { name: 'Tarix', href: '/sales', icon: History },
    { name: 'Mijozlar', href: '/customers', icon: Users },
    { name: 'Sozlamalar', href: '/settings', icon: Settings },
  ]

  if (pathname === '/') return null

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold group">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline-block">Magazin POS</span>
          </Link>

          <nav className="flex items-center gap-1">
            {nav.map(item => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden md:inline-block">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
