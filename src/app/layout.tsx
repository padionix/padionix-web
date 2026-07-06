import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AnalyticsWrapper from "@/components/AnalyticsWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ScrollAnimations from "@/components/ScrollAnimations";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://padionix-web.vercel.app'

export const metadata: Metadata = {
  title: {
    default: "Padionix — No Hama, No Drama",
    template: "%s | Padionix",
  },
  description:
    "Padionix adalah platform IoT berbasis AI untuk monitoring dan deteksi hama tanaman secara real-time. Solusi cerdas petani modern Indonesia.",
  robots: { index: true, follow: true },
  metadataBase: new URL(siteUrl),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Padionix',
    title: 'Padionix — No Hama, No Drama',
    description: 'Platform IoT berbasis AI untuk monitoring dan deteksi hama tanaman secara real-time. Lindungi lahan Anda dengan teknologi cerdas.',
    url: '/',
    locale: 'id_ID',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Padionix — Platform IoT Pertanian AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Padionix — No Hama, No Drama',
    description: 'Platform IoT berbasis AI untuk monitoring dan deteksi hama tanaman secara real-time.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Padionix',
              applicationCategory: 'AgriculturalApplication',
              operatingSystem: 'Web & IoT',
              description: 'Platform IoT berbasis AI untuk monitoring dan deteksi hama tanaman secara real-time.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'IDR',
              },
              author: { '@type': 'Organization', name: 'Padionix' },
            }),
          }}
        />
        {children}
        <AnalyticsWrapper />
        <WhatsAppWidget />
        <ScrollAnimations />
        </ThemeProvider>
      </body>
    </html>
  );
}
