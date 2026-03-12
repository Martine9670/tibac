import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface Props {
  params: { code: string }
}

export default async function ResultsPage({ params }: Props) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', params.code.toUpperCase())
    .single()

  if (!room) notFound()

  // Récupérer tous les rounds
  const { data: rounds } = await supabase
    .from('rounds')
    .select('id, round_number, letter')
    .eq('room_id', room.id)
    .order('round_number')

  // Récupérer tous les scores avec profils
  const roundIds = rounds?.map((r) => r.id) ?? []
  const { data: scores } = await supabase
    .from('scores')
    .select('*, profiles(username, avatar_url)')
    .in('round_id', roundIds)

  // Agréger par joueur
  const playerMap: Record<string, { username: string; avatar_url: string | null; total: number; rounds: Record<string, number> }> = {}

  for (const score of scores ?? []) {
    const pid = score.player_id
    if (!playerMap[pid]) {
      playerMap[pid] = {
        username: (score as any).profiles?.username ?? 'Joueur',
        avatar_url: (score as any).profiles?.avatar_url ?? null,
        total: 0,
        rounds: {},
      }
    }
    const pts = score.points + score.bac_bonus
    playerMap[pid].total += pts
    playerMap[pid].rounds[score.round_id] = pts
  }

  const leaderboard = Object.entries(playerMap)
    .sort(([, a], [, b]) => b.total - a.total)

  const medals = ['🥇', '🥈', '🥉']

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">

        <div className="text-center space-y-1">
          <h1 className="text-4xl font-black text-white">Résultats 🏆</h1>
          <p className="text-zinc-400 text-sm">{room.round_count} manches — Partie terminée</p>
        </div>

        {/* Podium */}
        <div className="space-y-2">
          {leaderboard.map(([pid, data], i) => (
            <div
              key={pid}
              className={`flex items-center justify-between rounded-2xl px-5 py-4 border ${
                i === 0
                  ? 'bg-yellow-400/10 border-yellow-400/40'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{medals[i] ?? `${i + 1}.`}</span>
                <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white text-sm">
                  {data.username[0].toUpperCase()}
                </div>
                <span className={`font-bold ${i === 0 ? 'text-yellow-400' : 'text-white'}`}>
                  {data.username}
                  {pid === user.id && <span className="text-zinc-500 font-normal text-xs ml-1">(toi)</span>}
                </span>
              </div>
              <span className={`text-xl font-black ${i === 0 ? 'text-yellow-400' : 'text-white'}`}>
                {data.total} pts
              </span>
            </div>
          ))}
        </div>

        {/* Détail par manche */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 overflow-x-auto">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Détail par manche
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-xs">
                <th className="text-left pb-2 font-medium">Joueur</th>
                {rounds?.map((r) => (
                  <th key={r.id} className="text-center pb-2 font-medium px-2">
                    <span className="text-yellow-400 font-black">{r.letter}</span>
                  </th>
                ))}
                <th className="text-right pb-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(([pid, data]) => (
                <tr key={pid} className="border-t border-zinc-800">
                  <td className="py-2 text-white font-medium">{data.username}</td>
                  {rounds?.map((r) => (
                    <td key={r.id} className="text-center py-2 text-zinc-300 px-2">
                      {data.rounds[r.id] ?? 0}
                    </td>
                  ))}
                  <td className="text-right py-2 font-black text-yellow-400">{data.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Link
          href="/lobby"
          className="block w-full text-center bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-black rounded-xl py-3 text-base transition-colors"
        >
          Rejouer 🎲
        </Link>

      </div>
    </main>
  )
}
