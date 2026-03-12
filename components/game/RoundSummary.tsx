'use client'

import { useState } from 'react'
import { useGameStore } from '@/lib/stores/gameStore'
import { nextRound } from '@/lib/actions/round.actions'
import type { Round } from '@/types/game.types'

interface Props {
  round: Round
  totalRounds: number
  roomId: string
  isHost: boolean
}

export default function RoundSummary({ round, totalRounds, roomId, isHost }: Props) {
  const { scores, answers, players, categories } = useGameStore()
  const [loading, setLoading] = useState(false)

  const roundAnswers = answers.filter((a) => a.round_id === round.id)
  const isLastRound = round.round_number >= totalRounds

  async function handleNext() {
    setLoading(true)
    await nextRound(roomId, round.round_number)
  }

  // Trier les scores de ce round
  const roundScores = scores
    .map((s) => ({ ...s, roundPts: s.rounds.find((r) => r)?.points ?? 0 }))
    .sort((a, b) => b.total_points - a.total_points)

  return (
    <div className="max-w-lg mx-auto pt-6 space-y-6">
      <div className="text-center">
        <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">
          Manche {round.round_number} / {totalRounds}
        </p>
        <h2 className="text-white font-black text-3xl">
          Lettre <span className="text-yellow-400">{round.letter}</span>
        </h2>
      </div>

      {/* Réponses par catégorie */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const catAnswers = roundAnswers.filter((a) => a.category_id === cat.id && a.value)
          return (
            <div key={cat.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                {cat.emoji} {cat.name}
              </p>
              <div className="space-y-1">
                {catAnswers.length === 0 ? (
                  <p className="text-zinc-600 text-sm italic">Aucune réponse</p>
                ) : (
                  catAnswers.map((a) => {
                    const player = players.find((p) => p.player_id === a.player_id)
                    const username = (player as any)?.profiles?.username ?? 'Joueur'
                    // Trouver si la réponse est unique
                    const same = catAnswers.filter(
                      (o) => o.value?.toLowerCase().trim() === a.value?.toLowerCase().trim()
                    ).length
                    const pts = a.is_valid === false ? 0 : same === 1 ? 2 : 1

                    return (
                      <div key={a.id} className="flex items-center justify-between text-sm">
                        <span className="text-white">
                          {a.value}
                          <span className="text-zinc-500 text-xs ml-2">— {username}</span>
                        </span>
                        <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                          pts === 0
                            ? 'bg-red-500/20 text-red-400'
                            : pts === 2
                            ? 'bg-yellow-400/20 text-yellow-400'
                            : 'bg-zinc-700 text-zinc-300'
                        }`}>
                          {pts === 0 ? '✕' : `+${pts}`}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Classement provisoire */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Classement provisoire
        </p>
        {scores
          .sort((a, b) => b.total_points - a.total_points)
          .map((s, i) => (
            <div key={s.player_id} className="flex items-center justify-between text-sm">
              <span className="text-zinc-400 w-5">{i + 1}.</span>
              <span className="flex-1 text-white font-medium">{s.username}</span>
              <span className="text-yellow-400 font-black">{s.total_points} pts</span>
            </div>
          ))}
      </div>

      {isHost && (
        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-900 font-black rounded-xl py-3 text-base transition-colors"
        >
          {loading
            ? 'Chargement...'
            : isLastRound
            ? '🏆 Voir les résultats finaux'
            : `Manche suivante →`}
        </button>
      )}

      {!isHost && (
        <p className="text-center text-zinc-500 text-sm animate-pulse">
          En attente de l&apos;hôte...
        </p>
      )}
    </div>
  )
}
