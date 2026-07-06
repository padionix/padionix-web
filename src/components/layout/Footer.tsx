import Link from 'next/link'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Fitur', href: '#' },
      { label: 'Harga', href: '#' },
      { label: 'Demo', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Tentang', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Karir', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Kebijakan Privasi', href: '#' },
      { label: 'Syarat & Ketentuan', href: '#' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'GitHub', href: '#' },
      { label: 'Instagram', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t pt-6 flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>&copy; {new Date().getFullYear()} Padionix. All rights reserved.</p>
          <p>Made for Indonesian farmers 🌾</p>
        </div>
      </div>
    </footer>
  )
}
