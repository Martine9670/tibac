'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/lib/stores/gameStore'
import { useRoom, usePlayers, useRound, useAnswers, useScores } from '@/lib/hooks/useRealtime'
import ScoreBoard from '@/components/game/ScoreBoard'
import type { Room, RoomPlayer, Round, Category } from '@/types/game.types'

interface Props {
  room: Room
  initialRound: Round | null
  initialPlayers: RoomPlayer[]
  categories: Category[]
}

export default function SpectatorView({ room, initialRound, initialPlayers, categories }: Props) {
  const { setRoom, setPlayers, setCategories, setCurrentRound, setPhase, phase, currentRound, players, answers } = useGameStore()

  useEffect(() => {
    setRoom(room)
    setPlayers(initialPlayers)
    setCategories(categories)
    if (initialRound) {
      setCurrentRound(initialRound)
      if (initialRound.status === 'active') setPhase('playing')
      else if (initialRound.status === 'voting') setPhase('voting')
    }
  }, [])

  useRoom(room.id)
  usePlayers(room.id)
  useRound(room.id)
  useAnswers(currentRound?.id ?? null)
  useScores(currentRound?.id ?? null)

  const submittedPlayers = players.filter((p) =>
    answers.some((a) => a.player_id === p.player_id && a.round_id === currentRound?.id)
  )

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="bg-yellow-400/10 border-b border-yellow-400/20 px-4 py-2 text-center">
        <p className="text-yellow-400 text-xs font-semibold">👁 Mode spectateur — Salle {room.code}</p>
      </div>

      <ScoreBoard roomId={room.id} currentUserId="" />

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">
        {/* Lettre en cours */}
        {currentRound && (
          <div className="text-center">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">
              Manche {currentRound.round_number} / {room.round_count}
            </p>
            <div className="inline-flex items-center justify-center w-28 h-28 bg-yellow-400/10 border-2 border-yellow-400/30 rounded-3xl">
              <span className="text-yellow-400 font-black text-7xl">{currentRound.letter}</span>
            </div>
            <p className="mt-3 text-zinc-400 text-sm capitalize">
              {phase === 'playing' && `${submittedPlayers.length}/${players.length} ont soumis`}
              {phase === 'voting' && '⏳ Phase de vote en cours...'}
              {phase === 'round-summary' && '📊 Résumé de la manche'}
            </p>
          </div>
        )}

        {/* Joueurs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Joueurs ({players.length})
          </p>
          {players.map((p) => {
            const hasSubmitted = answers.some((a) => a.player_id === p.player_id && a.round_id === currentRound?.id)
            return (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-white">
                  {(p as any).profiles?.avatar_url ?? ''} {(p as any).profiles?.username ?? 'Joueur'}
                  {p.player_id === room.host_id && <span className="text-yellow-400 ml-1 text-xs">👑</span>}
                </span>
                <span className={`text-xs font-semibold ${hasSubmitted ? 'text-green-400' : 'text-zinc-600'}`}>
                  {hasSubmitted ? '✓ soumis' : 'en cours...'}
                </span>
              </div>
            )
          })}
        </div>

        {room.status === 'finished' && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-white font-black text-xl">Partie terminée !</p>
          </div>
        )}
      </div>
    </main>
  )
}
