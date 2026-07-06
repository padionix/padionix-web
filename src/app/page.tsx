import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight, Cpu, Brain, BarChart3, Radio, Users, Shield, Droplets, Thermometer, BugPlay, Check, Bell,
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

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
            <ThemeToggle />
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
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 text-center md:text-left">
                <Badge className="mb-4">AI-Powered IoT untuk Pertanian</Badge>
                <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                  No Hama,{' '}
                  <span className="text-primary">No Drama</span>
                </h1>
                <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto md:mx-0">
                  Platform IoT berbasis AI untuk monitoring dan deteksi hama tanaman secara real-time.
                  Lindungi lahan Anda dengan teknologi cerdas.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto">Mulai Sekarang <ArrowRight className="h-4 w-4" /></Button>
                  </Link>
                  <a href="#fitur" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8 w-full sm:w-auto">
                    Pelajari Lebih Lanjut
                  </a>
                </div>
              </div>
              {/* Hero SVG illustration — agricultural IoT concept */}
              <div className="hidden md:flex flex-1 justify-center">
                <svg viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md h-auto">
                  {/* Background circle */}
                  <circle cx="200" cy="175" r="150" fill="#1B7A4A" opacity="0.08" />
                  <circle cx="200" cy="175" r="110" fill="#1B7A4A" opacity="0.06" />
                  {/* Stem */}
                  <path d="M200 320 L200 180" stroke="#1B7A4A" strokeWidth="4" strokeLinecap="round" />
                  {/* Left leaf */}
                  <path d="M200 250 C160 230 130 190 140 150 C150 170 170 195 200 210" fill="#1B7A4A" opacity="0.25" />
                  <path d="M200 250 C160 230 130 190 140 150" stroke="#1B7A4A" strokeWidth="2" fill="none" />
                  {/* Right leaf */}
                  <path d="M200 230 C240 210 270 170 260 130 C250 150 230 175 200 190" fill="#1B7A4A" opacity="0.25" />
                  <path d="M200 230 C240 210 270 170 260 130" stroke="#1B7A4A" strokeWidth="2" fill="none" />
                  {/* Top leaf */}
                  <path d="M200 180 C190 140 175 100 185 60 C195 90 200 120 200 150" fill="#1B7A4A" opacity="0.35" />
                  <path d="M200 180 C210 140 225 100 215 60 C205 90 200 120 200 150" fill="#1B7A4A" opacity="0.2" />
                  <path d="M200 180 C190 140 175 100 185 60" stroke="#1B7A4A" strokeWidth="2" fill="none" />
                  <path d="M200 180 C210 140 225 100 215 60" stroke="#1B7A4A" strokeWidth="2" fill="none" />
                  {/* Sensor node 1 — soil sensor */}
                  <rect x="145" y="290" width="40" height="28" rx="6" fill="#1B7A4A" />
                  <circle cx="155" cy="304" r="3" fill="#fff" />
                  <circle cx="165" cy="304" r="3" fill="#fff" opacity="0.6" />
                  <line x1="165" y1="290" x2="165" y2="275" stroke="#1B7A4A" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="165" y1="275" x2="200" y2="260" stroke="#1B7A4A" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
                  {/* Sensor node 2 — leaf sensor */}
                  <circle cx="270" cy="120" r="14" fill="#1B7A4A" />
                  <circle cx="270" cy="120" r="8" fill="none" stroke="#fff" strokeWidth="1.5" />
                  <line x1="260" y1="120" x2="248" y2="155" stroke="#1B7A4A" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
                  {/* Signal waves from sensor 2 */}
                  <path d="M270 100 C275 95 280 95 285 100" stroke="#1B7A4A" strokeWidth="1.5" fill="none" opacity="0.5" />
                  <path d="M268 95 C275 88 283 88 290 95" stroke="#1B7A4A" strokeWidth="1.5" fill="none" opacity="0.3" />
                  {/* Data visualization — mini chart */}
                  <rect x="280" y="220" width="100" height="70" rx="8" fill="#fff" stroke="#1B7A4A" strokeWidth="1.5" />
                  <polyline points="290,275 300,260 315,268 325,245 335,250 345,230 370,235" stroke="#1B7A4A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="290,275 300,260 315,268 325,245 335,250 345,230 370,235 370,275" fill="#1B7A4A" opacity="0.1" />
                  {/* Chart label */}
                  <text x="290" y="237" fontSize="8" fill="#1B7A4A" fontWeight="600">Real-time</text>
                  {/* Connection line to chart */}
                  <line x1="270" y1="134" x2="310" y2="220" stroke="#1B7A4A" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                  {/* Humidity indicator */}
                  <circle cx="110" cy="140" r="20" fill="#1B7A4A" opacity="0.15" />
                  <text x="100" y="137" fontSize="7" fill="#1B7A4A" fontWeight="500">💧</text>
                  <text x="101" y="150" fontSize="8" fill="#1B7A4A" fontWeight="600">82%</text>
                  {/* Temperature indicator */}
                  <circle cx="310" cy="80" r="20" fill="#1B7A4A" opacity="0.15" />
                  <text x="300" y="77" fontSize="7" fill="#1B7A4A" fontWeight="500">🌡️</text>
                  <text x="301" y="90" fontSize="8" fill="#1B7A4A" fontWeight="600">28°C</text>
                </svg>
              </div>
            </div>
          </div>
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
        <section id="fitur" className="py-16 md:py-24">
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
                    <Link href="/register">
                    <Button variant={tier.popular ? 'default' : 'outline'} className="w-full mt-4">Pilih {tier.name}</Button>
                    </Link>
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
            <div className="flex flex-col md:flex-row justify-center gap-8 items-center">
              {[
                { n: 2, title: 'Zero Hunger', desc: 'Mengurangi kelaparan melalui optimalisasi hasil panen dengan teknologi IoT untuk ketahanan pangan nasional.' },
                { n: 9, title: 'Industry, Innovation & Infrastructure', desc: 'Mendorong inovasi pertanian 4.0 dengan infrastruktur IoT modern untuk petani Indonesia.' },
                { n: 12, title: 'Responsible Consumption & Production', desc: 'Efisiensi sumber daya melalui pertanian presisi yang berkelanjutan dan ramah lingkungan.' },
              ].map((item) => (
                <div key={item.n} className="flex flex-col items-center max-w-xs">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                    {item.n}
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="font-display text-3xl font-bold">Apa Kata Petani</h2>
              <p className="mt-2 text-muted-foreground">Testimoni dari pengguna Padionix di seluruh Indonesia</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { initial: 'B', name: 'Pak Budi', role: 'Petani Padi, Jawa Timur', quote: 'Setelah pakai Padionix, saya bisa deteksi hama lebih awal. Hasil panen naik 30% dalam 3 bulan pertama.' },
                { initial: 'S', name: 'Ibu Sari', role: 'Petani Sayur, Jawa Barat', quote: 'Dulu cek tanaman manual 5 jam sehari. Sekarang cukup lihat HP. Luar biasa efisien!' },
                { initial: 'K', name: 'Kelompok Tani Makmur', role: 'Gabungan Kelompok Tani, Yogyakarta', quote: 'Kami menggunakan Padionix di 50 hektar lahan. Monitoring real-time membantu kami ambil keputusan cepat.' },
              ].map((t, i) => (
                <Card key={i}>
                  <CardHeader className="text-center">
                    <div className="mx-auto h-14 w-14 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-white">
                      {t.initial}
                    </div>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="flex justify-center gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <svg key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground italic">&ldquo;{t.quote}&rdquo;</p>
                    <div>
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="font-display text-3xl font-bold">Pertanyaan Umum</h2>
              <p className="mt-2 text-muted-foreground">Yang sering ditanyakan tentang Padionix</p>
            </div>
            <div className="space-y-3">
              {[
                { q: 'Bagaimana cara memasang sensor IoT?', a: 'Pemasangan sangat mudah. Sensor Padionix dirancang plug-and-play — cukup tancapkan ke tanah, hubungkan ke jaringan listrik, dan ikuti panduan di aplikasi. Tim kami juga siap mendampingi instalasi untuk area lebih dari 1 hektar.' },
                { q: 'Berapa biaya berlangganan?', a: 'Kami menawarkan paket Free Rp 0 untuk 1 perangkat dengan data 7 hari, Pro Rp 149rb per bulan untuk 10 perangkat dengan fitur AI Detection, dan Enterprise dengan harga khusus untuk instansi. Lihat halaman pricing untuk detail lengkap.' },
                { q: 'Apakah data saya aman?', a: 'Tentu. Semua data sensor dienkripsi end-to-end dan disimpan di server terpercaya di Indonesia. Kami menerapkan standar keamanan ISO 27001 dan tidak membagikan data Anda ke pihak ketiga tanpa izin.' },
                { q: 'Bagaimana jika tidak ada sinyal internet?', a: 'Sensor Padionix memiliki penyimpanan lokal offline buffer hingga 7 hari. Data akan otomatis tersinkronisasi saat koneksi internet tersedia kembali. Cocok untuk area terpencil.' },
                { q: 'Apakah ada garansi?', a: 'Ya, setiap sensor Padionix dilengkapi garansi perangkat 1 tahun. Kerusakan akibat pemakaian normal akan diganti gratis. Kami juga menyediakan layanan perbaikan cepat dengan SLA maksimal 2 kali 24 jam.' },
              ].map((faq, i) => (
                <details key={i} className="rounded-lg border bg-background p-4 group open:shadow-sm transition-shadow">
                  <summary className="cursor-pointer list-none flex items-center justify-between font-medium text-foreground [&::-webkit-details-marker]:hidden">
                    <span>{faq.q}</span>
                    <svg className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </details>
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

      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/#fitur" className="hover:text-primary transition-colors">Fitur</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Harga</Link></li>
                <li><Link href="/demo" className="hover:text-primary transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/tentang" className="hover:text-primary transition-colors">Tentang</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/karir" className="hover:text-primary transition-colors">Karir</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Social</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://github.com/padionix" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a></li>
                <li><a href="https://instagram.com/padionix" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a></li>
                <li><a href="https://linkedin.com/company/padionix" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} Padionix. All rights reserved.</span>
            <span>Dibuat dengan ❤️ untuk petani Indonesia</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
