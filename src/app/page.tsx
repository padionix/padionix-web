import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight, Cpu, Brain, BarChart3, Radio, Users, Shield, Droplets, Thermometer, BugPlay, Check, Bell,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className="font-display text-xl font-bold text-primary">Padionix</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Masuk</Link>
            <Link href="/register">
              <Button size="sm">Daftar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4">AI-Powered IoT untuk Pertanian</Badge>
              <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                No Hama,{' '}
                <span className="text-primary">No Drama</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
                Platform IoT berbasis AI untuk monitoring dan deteksi hama tanaman secara real-time.
                Lindungi lahan Anda dengan teknologi cerdas.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">Mulai Sekarang <ArrowRight className="h-4 w-4" /></Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">Pelajari Lebih Lanjut</Button>
              </div>
            </div>
          </div>
          {/* ponytail: CSS subtle animation */}
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        </section>

        {/* Problem */}
        <section className="py-16 md:py-24 border-t">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="font-display text-3xl font-bold">Masalah yang Kami Selesaikan</h2>
              <p className="mt-2 text-muted-foreground">Petani Indonesia menghadapi 3 tantangan utama</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: BugPlay, title: 'Serangan Hama Tak Terdeteksi', desc: '40% gagal panen disebabkan hama yang tidak terdeteksi dini.', stat: '40%' },
                { icon: Thermometer, title: 'Monitoring Manual', desc: 'Petani menghabiskan 5+ jam per hari untuk pengecekan manual.', stat: '5 jam' },
                { icon: Droplets, title: 'Data Tak Terpusat', desc: 'Tidak ada sistem yang mengintegrasikan data sensor secara real-time.', stat: '0' },
              ].map((item) => (
                <Card key={item.title} className="text-center">
                  <CardHeader>
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-3xl font-bold text-primary">{item.stat}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="font-display text-3xl font-bold">Bagaimana Cara Kerjanya</h2>
              <p className="mt-2 text-muted-foreground">4 langkah mudah melindungi lahan Anda</p>
            </div>
            <div className="grid gap-8 md:grid-cols-4">
              {[
                { icon: Cpu, step: '01', title: 'Pasang IoT', desc: 'Pasang sensor Padionix di lahan Anda' },
                { icon: Brain, step: '02', title: 'AI Mendeteksi', desc: 'AI menganalisis gambar dan data sensor' },
                { icon: BarChart3, step: '03', title: 'Dashboard', desc: 'Pantau kondisi secara real-time' },
                { icon: ArrowRight, step: '04', title: 'Ambil Aksi', desc: 'Terima notifikasi dan lakukan tindakan' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center mb-4">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <div className="text-xs font-bold text-primary mb-1">{item.step}</div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="font-display text-3xl font-bold">Fitur Unggulan</h2>
              <p className="mt-2 text-muted-foreground">Semua yang Anda butuhkan untuk smart farming</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: Radio, title: 'Real-time Monitoring', desc: 'Pemantauan suhu, kelembaban, dan kondisi tanaman 24/7' },
                { icon: Brain, title: 'AI Detection', desc: 'Deteksi otomatis hama dan penyakit dengan akurasi tinggi' },
                { icon: Bell, title: 'Smart Alerts', desc: 'Notifikasi instan saat terdeteksi ancaman' },
                { icon: BarChart3, title: 'Analytics & Reports', desc: 'Laporan harian, mingguan, dan bulanan otomatis' },
                { icon: Shield, title: 'Data Terenkripsi', desc: 'Keamanan data tingkat enterprise dengan enkripsi end-to-end' },
                { icon: Users, title: 'Multi-User', desc: 'Kolaborasi tim dengan role management' },
              ].map((item) => (
                <Card key={item.title}>
                  <CardHeader>
                    <item.icon className="h-10 w-10 text-primary mb-2" />
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="font-display text-3xl font-bold">Pilihan Paket</h2>
              <p className="mt-2 text-muted-foreground">Mulai gratis, upgrade kapan saja</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              {[
                { name: 'Free', price: 'Rp 0', desc: 'Untuk petani individu memulai', features: ['1 perangkat', 'Data 7 hari', 'Notifikasi email', 'Dashboard dasar'] },
                { name: 'Pro', price: 'Rp 149rb', desc: 'Untuk kelompok tani', features: ['10 perangkat', 'Data 30 hari', 'Notifikasi WhatsApp', 'AI Detection', 'Laporan mingguan'], popular: true },
                { name: 'Enterprise', price: 'Custom', desc: 'Untuk dinas/instansi', features: ['Unlimited perangkat', 'Data 1 tahun', 'Semua notifikasi', 'AI Detection + Custom Model', 'API Access', 'Dedicated support'] },
              ].map((tier) => (
                <Card key={tier.name} className={tier.popular ? 'border-primary shadow-lg relative' : ''}>
                  {tier.popular && <div className="absolute -top-3 left-0 right-0 text-center"><Badge className="bg-primary text-white">Paling Populer</Badge></div>}
                  <CardHeader>
                    <CardTitle>{tier.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      {tier.price !== 'Custom' && <span className="text-muted-foreground">/bulan</span>}
                    </div>
                    <CardDescription>{tier.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {tier.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary shrink-0" />{f}</div>
                    ))}
                    <Button variant={tier.popular ? 'default' : 'outline'} className="w-full mt-4">Pilih {tier.name}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SDGs */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="font-display text-3xl font-bold mb-4">Kontribusi Terhadap SDGs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Padionix mendukung Tujuan Pembangunan Berkelanjutan (SDGs) terutama poin 2 (Zero Hunger),
              9 (Industry, Innovation, Infrastructure), dan 12 (Responsible Consumption & Production)
              melalui pertanian presisi berbasis teknologi.
            </p>
            <div className="flex justify-center gap-8">
              {[2, 9, 12].map((n) => (
                <div key={n} className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                  {n}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="font-display text-3xl font-bold mb-4">Siap Melindungi Lahan Anda?</h2>
            <p className="mb-8 opacity-90 max-w-xl mx-auto">Bergabung dengan ribuan petani modern yang sudah menggunakan Padionix</p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">Daftar Gratis Sekarang</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Padionix. Made for Indonesian farmers.
      </footer>
    </div>
  )
}
