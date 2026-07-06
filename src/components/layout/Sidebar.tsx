'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  Home, Cpu, BugPlay, Bell, FileText, MapPin, Settings,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Sidebar() {
  const pathname = usePathname()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  const navItems = [
    { href: userId ? `/dashboard/${userId}` : '/dashboard', label: 'Home', icon: Home },
    { href: '/devices', label: 'Devices', icon: Cpu },
    { href: '/detections', label: 'Detections', icon: BugPlay },
    { href: '/alerts', label: 'Alerts', icon: Bell },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/map', label: 'Map', icon: MapPin },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="hidden md:flex md:w-64 flex-col border-r bg-background h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
          P
        </div>
        <span className="font-display text-lg font-bold text-primary">Padionix</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const isLoading = item.label === 'Home' && !userId
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                isLoading && 'opacity-40 pointer-events-none',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4 text-xs text-foreground/50 text-center">
        Padionix v0.1
      </div>
    </aside>
  )
}
