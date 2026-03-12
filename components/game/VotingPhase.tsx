'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/lib/stores/gameStore'
import { finishVoting } from '@/lib/actions/round.actions'
import type { Round, Category } from '@/types/game.types'

interface Props {
  round: Round
  categories: Category[]
  currentUserId: string
  isHost: boolean
  roomId: string
}

interface ValidationResult {
  [categoryId: string]: { valid: boolean; reason: string; points: number }
}

const SEVEN_LETTERS_CATEGORY_ID = 'f7fa4e60-8578-4fd9-b9ce-5c883eb1dc10'

function validateAnswer(value: string, letter: string, categoryId: string = ''): { valid: boolean; reason: string; points: number } {
  const trimmed = value.trim()
  if (!trimmed) return { valid: false, reason: 'Vide', points: 0 }
  if (!trimmed.toUpperCase().startsWith(letter.toUpperCase())) return { valid: false, reason: `Ne commence pas par "${letter}"`, points: 0 }
  if (trimmed.length < 3) return { valid: false, reason: 'Réponse trop courte (min. 3 caractères)', points: 0 }
  const withoutLetter = trimmed.slice(1)
  if (!withoutLetter.match(/[a-zA-ZÀ-ÿ]/)) return { valid: false, reason: 'Réponse invalide', points: 0 }
  if (categoryId === SEVEN_LETTERS_CATEGORY_ID) {
    const lettersOnly = trimmed.replace(/[^a-zA-ZÀ-ÿ]/g, '')
    if (lettersOnly.length < 7) return { valid: false, reason: `Mot trop court (${lettersOnly.length} lettres, min. 7)`, points: 0 }
  }
  return { valid: true, reason: 'Valide ✓', points: 2 }
}

export default function VotingPhase({ round, categories, currentUserId, isHost, roomId }: Props) {
  const { answers, players } = useGameStore()
  const [results, setResults] = useState<ValidationResult | null>(null)
  const [finishing, setFinishing] = useState(false)

  const myAnswers = answers.filter((a) => a.player_id === currentUserId && a.round_id === round.id)
  const isSolo = players.length === 1

  useEffect(() => {
    if (isSolo && myAnswers.length > 0 && !results) {
      const validation: ValidationResult = {}
      for (const cat of categories) {
        const answer = myAnswers.find((a) => a.category_id === cat.id)
        validation[cat.id] = validateAnswer(answer?.value ?? '', round.letter, cat.id)
      }
      setResults(validation)
    }
  }, [myAnswers.length])

  async function handleFinish() {
    setFinishing(true)
    if (isSolo && results) {
      // Passer les vrais scores à la server action
      const soloScores: Record<string, number> = {}
      for (const [catId, r] of Object.entries(results)) {
        soloScores[catId] = r.points
      }
      await finishVoting(round.id, soloScores)
    } else {
      await finishVoting(round.id)
    }
  }

  if (isSolo && results) {
    const total = Object.values(results).reduce((acc, r) => acc + r.points, 0)
    return (
      <div className="max-w-lg mx-auto pt-6 space-y-5">
        <div className="text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Résultats — Lettre {round.letter}</p>
          <p className="text-yellow-400 font-black text-4xl">+{total} pts</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {categories.map((cat, i) => {
            const r = results[cat.id]
            const answer = myAnswers.find((a) => a.category_id === cat.id)
            return (
              <div key={cat.id} className={`flex items-center justify-between p-4 ${i < categories.length - 1 ? 'border-b border-zinc-800' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.emoji}</span>
                  <div>
                    <p className="text-zinc-400 text-xs uppercase tracking-wider">{cat.name}</p>
                    <p className={`font-medium text-sm ${r?.valid ? 'text-white' : 'text-zinc-500 line-through'}`}>
                      {answer?.value || '—'}
                    </p>
                    {r && !r.valid && <p className="text-red-400 text-xs">{r.reason}</p>}
                  </div>
                </div>
                <span className={`font-black text-lg ${r?.points ? 'text-yellow-400' : 'text-zinc-600'}`}>
                  {r?.points ? `+${r.points}` : '0'}
                </span>
              </div>
            )
          })}
        </div>

        <button onClick={handleFinish} disabled={finishing}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-900 font-black rounded-xl py-4 text-base transition-all active:scale-95">
          {finishing ? 'Chargement...' : 'Voir le résumé →'}
        </button>
      </div>
    )
  }

  // Mode multijoueur
  return (
    <div className="max-w-lg mx-auto pt-6 space-y-5">
      <div className="text-center">
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Phase de vote</p>
        <p className="text-white font-bold">Lettre : <span className="text-yellow-400 font-black text-2xl">{round.letter}</span></p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {categories.map((cat, i) => {
          const allCatAnswers = answers.filter((a) => a.category_id === cat.id && a.round_id === round.id)
          return (
            <div key={cat.id} className={`p-4 ${i < categories.length - 1 ? 'border-b border-zinc-800' : ''}`}>
              <p className="text-zinc-400 text-xs uppercase tracking-wider mb-2">{cat.emoji} {cat.name}</p>
              <div className="space-y-1.5">
                {allCatAnswers.map((a) => {
                  const player = players.find((p) => p.player_id === a.player_id)
                  const profile = (player as any)?.profiles
                  return (
                    <div key={a.id} className="flex items-center justify-between bg-zinc-800 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-zinc-500 text-xs">{profile?.username ?? 'Joueur'}</p>
                        <p className="text-white text-sm font-medium">{a.value || '—'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      {isHost && (
        <button onClick={handleFinish} disabled={finishing}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-900 font-black rounded-xl py-4 text-base transition-all active:scale-95">
          {finishing ? 'Calcul des scores...' : 'Valider et voir les scores →'}
        </button>
      )}
    </div>
  )
}