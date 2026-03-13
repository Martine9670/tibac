'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/lobby', label: '🎲 Nouvelle partie' },
  { href: '/leaderboard', label: '🏆 Classement' },
  { href: '/profile', label: '👤 Profil' },
]

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 px-4 py-2 safe-area-pb">
      <div className="max-w-lg mx-auto flex justify-around items-center">
        {links.map(({ href, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                active ? 'text-yellow-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="text-xl">{label.split(' ')[0]}</span>
              <span>{label.split(' ').slice(1).join(' ')}</span>
            </Link>
          )
        })}

        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-red-400 transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span>Quitter</span>
        </button>
      </div>
    </nav>
  )
}