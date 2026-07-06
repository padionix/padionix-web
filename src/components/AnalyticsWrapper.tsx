'use client'

import dynamic from 'next/dynamic'
import CookieConsentBanner from './CookieConsentBanner'

const GoogleAnalytics = dynamic(() => import('./GoogleAnalytics'), { ssr: false })

export default function AnalyticsWrapper() {
  return (
    <>
      <GoogleAnalytics />
      <CookieConsentBanner />
    </>
  )
}
