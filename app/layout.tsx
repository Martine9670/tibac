import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/lib/hooks/useToast'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Petit Bac — Le jeu de mots en ligne',
  description: 'Joue au Petit Bac en multijoueur temps réel avec tes amis.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Petit Bac' },
  openGraph: { title: 'Petit Bac', description: 'Le jeu classique de mots en multijoueur temps réel', type: 'website' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.className} bg-zinc-950 text-white antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
