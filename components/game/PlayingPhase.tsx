'use client'

import { useState, useCallback } from 'react'
import { useGameStore } from '@/lib/stores/gameStore'
import { submitAnswers } from '@/lib/actions/answer.actions'
import { callBac } from '@/lib/actions/round.actions'
import { getAnswerError } from '@/lib/utils/validation'
import Timer from '@/components/game/Timer'
import type { Round, Category } from '@/types/game.types'

interface Props {
  round: Round
  categories: Category[]
  timeLimit: number
  currentUserId: string
  isHost: boolean
}

export default function PlayingPhase({ round, categories, timeLimit, currentUserId, isHost }: Props) {
  const { answers: storeAnswers, players } = useGameStore()
  const [inputs, setInputs] = useState<Record<string, string>>(
    Object.fromEntries(categories.map((c) => [c.id, '']))
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [callingBac, setCallingBac] = useState(false)
  const [bacCalled, setBacCalled] = useState(!!round.winner_id)

  const submittedCount = players.filter((p) =>
    storeAnswers.some((a) => a.player_id === p.player_id && a.round_id === round.id)
  ).length

  function handleChange(categoryId: string, value: string) {
    setInputs((prev) => ({ ...prev, [categoryId]: value }))
    const err = getAnswerError(value, round.letter)
    setErrors((prev) => ({ ...prev, [categoryId]: err ?? '' }))
  }

  const handleSubmit = useCallback(async () => {
    if (submitted) return
    // Valider toutes les réponses
    const newErrors: Record<string, string> = {}
    let hasError = false
    for (const cat of categories) {
      const err = getAnswerError(inputs[cat.id] ?? '', round.letter)
      if (err) { newErrors[cat.id] = err; hasError = true }
    }
    if (hasError) { setErrors(newErrors); return }
    setSubmitted(true)
    await submitAnswers(round.id, inputs)
  }, [submitted, inputs, categories, round])

  const handleBac = async () => {
    if (bacCalled || callingBac) return
    setCallingBac(true)
    // Valider et soumettre
    const newErrors: Record<string, string> = {}
    for (const cat of categories) {
      const err = getAnswerError(inputs[cat.id] ?? '', round.letter)
      if (err) newErrors[cat.id] = err
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setCallingBac(false); return }
    await submitAnswers(round.id, inputs)
    setSubmitted(true)
    const result = await callBac(round.id)
    if (result?.error) { setCallingBac(false) }
    else { setBacCalled(true) }
  }

  const handleTimeUp = useCallback(async () => {
    if (!submitted) await handleSubmit()
  }, [submitted, handleSubmit])

  const filledCount = Object.values(inputs).filter((v) => v.trim()).length

  return (
    <div className="max-w-lg mx-auto pt-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Lettre</p>
          <p className="text-yellow-400 font-black text-6xl leading-none">{round.letter}</p>
        </div>
        <div className="text-right space-y-2">
          {timeLimit > 0 && <Timer seconds={timeLimit} onExpire={handleTimeUp} paused={bacCalled} />}
          <div className="text-right">
            <p className="text-zinc-500 text-xs">{filledCount}/{categories.length} remplis</p>
            <div className="w-24 h-1 bg-zinc-800 rounded-full mt-1 ml-auto">
              <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${(filledCount / categories.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Champs */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id}>
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1 mb-1">
              <span>{cat.emoji}</span>
              <span className="uppercase tracking-wider">{cat.name}</span>
            </label>
            <input
              type="text"
              value={inputs[cat.id] ?? ''}
              onChange={(e) => handleChange(cat.id, e.target.value)}
              disabled={submitted || bacCalled}
              placeholder={`${cat.name} en ${round.letter}...`}
              className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 text-sm disabled:opacity-50 transition-colors ${
                errors[cat.id]
                  ? 'border-red-500/60 focus:ring-red-500/30'
                  : inputs[cat.id]?.trim()
                  ? 'border-green-500/40 focus:ring-yellow-400/30'
                  : 'border-zinc-700 focus:ring-yellow-400'
              }`}
            />
            {errors[cat.id] && (
              <p className="text-red-400 text-xs mt-1">{errors[cat.id]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Progression des autres */}
      {players.length > 1 && (
        <p className="text-zinc-600 text-xs text-center">
          {submittedCount}/{players.length} joueurs ont soumis
        </p>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-2">
        {!submitted && !bacCalled && (
          <button onClick={handleSubmit}
            className="w-full bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-zinc-900 font-black text-lg rounded-2xl py-4 transition-all">
            ✅ Soumettre mes réponses
          </button>
        )}

        {submitted && !bacCalled && (
          <>
            <button
              onClick={handleBac}
              disabled={callingBac}
              className="w-full bg-red-500 hover:bg-red-400 active:scale-95 disabled:opacity-60 text-white font-black text-2xl rounded-2xl py-5 transition-all shadow-lg shadow-red-500/20"
            >
              {callingBac ? '⏳ ...' : '🛑 BAC !'}
            </button>
            <p className="text-center text-zinc-500 text-sm animate-pulse">
              ✓ Soumis — Clique BAC pour arrêter la manche !
            </p>
          </>
        )}

        {bacCalled && (
          <div className="w-full bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-center rounded-2xl py-4">
            ✓ BAC appelé ! En attente des autres...
          </div>
        )}
      </div>
    </div>
  )
}