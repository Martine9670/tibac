'use client'

import { usePathname } from 'next/navigation'
import Nav from '@/components/shared/Nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isGame = pathname.startsWith('/game/')

  return (
    <div className={isGame ? '' : 'pb-20'}>
      {children}
      {!isGame && <Nav />}
    </div>
  )
}