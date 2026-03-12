'use client'

import { useGameStore } from '@/lib/stores/gameStore'

interface Props {
  roomId: string
  currentUserId: string
}

export default function ScoreBoard({ roomId, currentUserId }: Props) {
  const { scores, players, currentRound, room } = useGameStore()

  // Merge scores avec les noms des joueurs
  const board = players.map((p) => {
    const score = scores.find((s) => s.player_id === p.player_id)
    return {
      player_id: p.player_id,
      username: (p as any).profiles?.username ?? 'Joueur',
      total: score?.total_points ?? 0,
      isMe: p.player_id === currentUserId,
    }
  }).sort((a, b) => b.total - a.total)

  if (board.length === 0) return null

  return (
    <div className="sticky top-0 z-10 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 px-4 py-2">
      <div className="max-w-lg mx-auto flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {/* Manche */}
        {currentRound && room && (
          <div className="shrink-0 mr-3 text-center">
            <p className="text-yellow-400 font-black text-sm leading-none">{currentRound.letter}</p>
            <p className="text-zinc-600 text-[10px]">{currentRound.round_number}/{room.round_count}</p>
          </div>
        )}

        {/* Scores */}
        {board.map((p, i) => (
          <div
            key={p.player_id}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              p.isMe
                ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300'
            }`}
          >
            <span className="text-zinc-500">{i + 1}.</span>
            <span>{p.username}</span>
            <span className="font-black">{p.total}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
