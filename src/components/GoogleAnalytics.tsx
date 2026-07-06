'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID
    if (!gaId) return

    const consent = localStorage.getItem('cookie_consent')
    if (consent !== 'accepted') return

    if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
      script.async = true
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      function gtag(...args: unknown[]) { window.dataLayer.push(args) }
      window.gtag = gtag
      gtag('js', new Date())
      gtag('config', gaId)
    }
  }, [])

  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID
    if (!gaId) return
    const consent = localStorage.getItem('cookie_consent')
    if (consent !== 'accepted') return

    if (typeof window.gtag === 'function') {
      window.gtag('config', gaId, {
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
      })
    }
  }, [pathname, searchParams])

  return null
}
