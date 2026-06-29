'use client'

import { Bell, Menu, Search, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useRealtime } from '@/lib/hooks/useRealtime'
import type { Alert } from '@/lib/types'

export default function Navbar({
  onToggleSidebar,
}: {
  onToggleSidebar?: () => void
}) {
  const alerts = useRealtime<Alert>('alerts')
  const unread = alerts.filter((a) => !a.is_read).length

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden -ml-2 p-2 text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="flex-1 md:max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari perangkat, deteksi..."
              className="pl-8 h-9 bg-muted/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] bg-danger text-white">
                {unread > 99 ? '99+' : unread}
              </Badge>
            )}
          </button>

          {/* Profile */}
          <button className="flex items-center gap-2 rounded-full p-1 hover:bg-muted transition-colors">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              U
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  )
}
