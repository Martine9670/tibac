import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, total_score, games_played')
    .order('total_score', { ascending: false })
    .limit(20)

  const medals = ['🥇', '🥈', '🥉']

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 pb-24">
      <div className="max-w-lg mx-auto space-y-6">

        <div className="text-center">
          <h1 className="text-3xl font-black text-white">Classement 🏆</h1>
          <p className="text-zinc-500 text-sm mt-1">Les meilleurs joueurs de Petit Bac</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {profiles?.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-5 py-4 border-b border-zinc-800 last:border-0 transition-colors ${
                p.id === user.id ? 'bg-yellow-400/5' : 'hover:bg-zinc-800/50'
              }`}
            >
              <span className="w-8 text-center text-lg shrink-0">
                {medals[i] ?? <span className="text-zinc-600 text-sm font-bold">{i + 1}</span>}
              </span>
              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-xl shrink-0">
                {p.avatar_url ?? p.username[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold truncate ${p.id === user.id ? 'text-yellow-400' : 'text-white'}`}>
                  {p.username}
                  {p.id === user.id && <span className="text-xs font-normal text-zinc-500 ml-1">(toi)</span>}
                </p>
                <p className="text-zinc-500 text-xs">{p.games_played ?? 0} parties jouées</p>
              </div>
              <span className="font-black text-white text-lg">{p.total_score ?? 0}</span>
            </div>
          ))}

          {(!profiles || profiles.length === 0) && (
            <div className="text-center py-12 text-zinc-600">
              Aucun joueur pour l&apos;instant. Sois le premier !
            </div>
          )}
        </div>

        <Link
          href="/lobby"
          className="block text-center text-zinc-500 hover:text-white text-sm transition-colors"
        >
          ← Retour au lobby
        </Link>
      </div>
    </main>
  )
}
