'use client'

import { MessageCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '6281234567890'

export default function WhatsAppWidget() {
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}`

  return (
    <>
      <style jsx>{`
        @keyframes wa-bounce {
          0%, 100% { transform: translateY(0); }
          20% { transform: translateY(-4px); }
          40% { transform: translateY(4px); }
          60% { transform: translateY(-2px); }
          80% { transform: translateY(1px); }
        }
        .wa-bounce {
          animation: wa-bounce 0.6s ease-out 0.3s both;
        }
      `}</style>
      <div className="fixed bottom-6 right-6 z-50 hidden sm:flex wa-bounce">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hubungi kami via WhatsApp"
          className="group relative flex h-14 w-14 min-w-[56px] min-h-[56px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-110 hover:shadow-xl active:scale-95"
        >
          <MessageCircle className="h-7 w-7" />
          {/* Tooltip */}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 pointer-events-none">
            Hubungi kami via WhatsApp
          </span>
        </a>
      </div>
    </>
  )
}
