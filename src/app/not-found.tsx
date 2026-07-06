import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6 max-w-md">
        {/* Large 404 */}
        <div className="font-display text-[10rem] leading-none font-extrabold text-primary/15 select-none">
          404
        </div>

        {/* Message */}
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Halaman tidak ditemukan
        </h1>

        <p className="text-muted-foreground leading-relaxed">
          Halaman yang Anda cari mungkin telah dipindahkan atau dihapus.
        </p>

        {/* Back to homepage */}
        <Link href="/">
          <Button size="lg" className="mt-4">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  )
}
