'use client'

import { Providers } from '@/app/providers'
import { cn } from '@/lib/utils/cn'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Users, BarChart3, Shield } from 'lucide-react'

const adminNav = [
  { href: '/admin/overview', label: 'Overview', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <Providers>
      <div className="flex min-h-screen">
        <aside className="w-64 flex-col border-r bg-background h-screen sticky top-0 hidden md:flex">
          <div className="flex items-center gap-2 px-6 py-5 border-b">
            <div className="h-8 w-8 rounded-lg bg-danger flex items-center justify-center text-white font-bold text-sm">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold">Admin Panel</span>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href}
                  className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-danger/10 text-danger' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}>
                  <Icon className="h-4 w-4" /> {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4 text-xs text-muted-foreground text-center">Admin &middot; Padionix</div>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur h-14 flex items-center px-6">
            <h2 className="font-display font-bold text-lg">Admin</h2>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </Providers>
  )
}
