'use client'

import Link from 'next/link'

type Item = { label: string; href?: string }
type Props = { items: Item[]; className?: string }

export default function Breadcrumbs({ items, className = '' }: Props) {
  return (
    <nav className={`mb-4 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={last ? 'text-foreground font-medium' : ''}>{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
