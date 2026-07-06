'use client'

import { useEffect, useState } from 'react'

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
    // Reload gtag by dispatching custom event or reloading page
    window.location.reload()
  }

  const reject = () => {
    localStorage.setItem('cookie_consent', 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#111',
        color: '#fff',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        zIndex: 9999,
        flexWrap: 'wrap',
      }}
    >
      <span>Kami menggunakan cookie untuk analitik. Setujui?</span>
      <button
        onClick={accept}
        style={{
          background: '#22c55e',
          color: '#fff',
          border: 'none',
          padding: '8px 20px',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Setuju
      </button>
      <button
        onClick={reject}
        style={{
          background: '#6b7280',
          color: '#fff',
          border: 'none',
          padding: '8px 20px',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Tolak
      </button>
    </div>
  )
}
