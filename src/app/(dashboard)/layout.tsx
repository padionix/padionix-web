'use client'

import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Providers } from '@/app/providers'
import { useState } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Providers>
      <div className="flex min-h-screen">
        <Sidebar />
        {sidebarOpen && (
          // ponytail: mobile overlay — minimal implementation
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="w-64 h-full bg-background" onClick={(e) => e.stopPropagation()}>
              <Sidebar />
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col">
          <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
          <Footer />
        </div>
      </div>
    </Providers>
  )
}
