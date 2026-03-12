'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/stores/gameStore'
import { usePlayers, useRoom } from '@/lib/hooks/useRealtime'
import { usePresence } from '@/lib/hooks/usePresence'
import { useToast } from '@/lib/hooks/useToast'
import { setReady, leaveRoom } from '@/lib/actions/room.actions'
import { startGame } from '@/lib/actions/round.actions'
import Avatar from '@/components/shared/Avatar'
import type { Room, RoomPlayer, Category } from '@/types/game.types'

interface Props {
  room: Room
  initialPlayers: RoomPlayer[]
  categories: Category[]
  currentUserId: string
  currentUsername: string
}

export default function WaitingRoom({ room, initialPlayers, categories, currentUserId, currentUsername }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const { setRoom, setPlayers, setCategories, players, phase } = useGameStore()

  useEffect(() => {
    setRoom(room)
    setPlayers(initialPlayers)
    setCategories(categories)
  }, [])

  useRoom(room.id)
  usePlayers(room.id)
  const { onlineIds } = usePresence(room.id, currentUserId, currentUsername)

  useEffect(() => {
    if (phase === 'letter-reveal' || phase === 'playing') router.push(`/game/${room.code}`)
  }, [phase])

  const isHost = room.host_id === currentUserId
  const me = players.find((p) => p.player_id === currentUserId)
  
  // L'hôte peut toujours démarrer, même seul
  const canStart = isHost
  const allReady = players.length > 1 && players.every((p) => p.is_ready || p.player_id === room.host_id)

  async function handleShare() {
    const url = `${window.location.origin}/lobby/${room.code}`
    if (navigator.share) {
      await navigator.share({ title: 'Rejoins ma partie !', text: `Code : ${room.code}`, url })
    } else {
      await navigator.clipboard.writeText(url)
      toast({ type: 'success', message: 'Lien copié !' })
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="max-w-lg mx-auto space-y-5">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white">Salle d&apos;attente</h1>
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2">
              <span className="text-zinc-400 text-sm">Code :</span>
              <span className="font-mono font-black text-yellow-400 text-xl tracking-widest">{room.code}</span>
            </div>
            <button onClick={handleShare} className="bg-zinc-900 border border-zinc-700 hover:border-yellow-400/50 text-zinc-400 hover:text-yellow-400 rounded-xl px-3 py-2 text-sm transition-colors" title="Partager">
              📤
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'manches', value: room.round_count },
            { label: 'secondes', value: room.time_limit === 0 ? '∞' : room.time_limit },
            { label: 'catégories', value: categories.length },
            { label: 'joueurs max', value: room.max_players },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-yellow-400 font-black text-xl">{value}</p>
              <p className="text-zinc-500 text-xs">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Catégories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat.id} className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-full border border-zinc-700">
                {cat.emoji} {cat.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Joueurs ({players.length}/{room.max_players})
          </p>
          <ul className="space-y-2">
            {players.map((player) => {
              const profile = (player as any).profiles
              return (
                <li key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar emoji={profile?.avatar_url} username={profile?.username ?? '?'} size="sm" isOnline={onlineIds.includes(player.player_id)} />
                    <span className="text-white text-sm font-medium">
                      {profile?.username ?? 'Joueur'}
                      {player.player_id === room.host_id && <span className="ml-1.5 text-yellow-400 text-xs">👑</span>}
                      {player.player_id === currentUserId && <span className="ml-1 text-zinc-500 text-xs">(toi)</span>}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    player.player_id === room.host_id || player.is_ready
                      ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {player.player_id === room.host_id ? '✓ hôte' : player.is_ready ? '✓ prêt' : 'en attente'}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="space-y-2">
          {isHost ? (
            <button onClick={() => startGame(room.id, room.code)} disabled={!canStart}
              className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-900 font-black rounded-xl py-3.5 text-base transition-all active:scale-95">
              {players.length === 1 ? '🎮 Jouer en solo' : allReady ? '🚀 Démarrer la partie' : `En attente... (${players.filter(p => p.is_ready || p.player_id === room.host_id).length}/${players.length} prêts)`}
            </button>
          ) : (
            <button onClick={() => setReady(room.id, !me?.is_ready)}
              className={`w-full font-black rounded-xl py-3.5 text-base transition-all active:scale-95 ${me?.is_ready ? 'bg-green-500 hover:bg-green-400 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}`}>
              {me?.is_ready ? '✓ Je suis prêt !' : 'Je suis prêt'}
            </button>
          )}
          <button onClick={() => leaveRoom(room.id, room.code)}
            className="w-full bg-transparent border border-zinc-800 hover:border-red-500/50 hover:text-red-400 text-zinc-600 font-medium rounded-xl py-2.5 text-sm transition-colors">
            Quitter la salle
          </button>
        </div>
      </div>
    </main>
  )
}