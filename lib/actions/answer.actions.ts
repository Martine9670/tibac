'use server'

import { createClient } from '@/lib/supabase/server'
import type { PlayerAnswers } from '@/types/game.types'

const SEVEN_LETTERS_CATEGORY_ID = 'f7fa4e60-8578-4fd9-b9ce-5c883eb1dc10'

function validateAnswer(value: string, letter: string, categoryId: string): { valid: boolean; reason: string; points: number } {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return { valid: false, reason: 'Vide', points: 0 }
  if (!trimmed.toUpperCase().startsWith(letter.toUpperCase())) return { valid: false, reason: `Ne commence pas par "${letter}"`, points: 0 }
  if (trimmed.length < 3) return { valid: false, reason: 'Réponse trop courte (min. 3 caractères)', points: 0 }
  const withoutLetter = trimmed.slice(1)
  if (!withoutLetter.match(/[a-zA-ZÀ-ÿ]/)) return { valid: false, reason: 'Réponse invalide', points: 0 }

  // Règle spéciale : mot de 7 lettres minimum
  if (categoryId === SEVEN_LETTERS_CATEGORY_ID) {
    const lettersOnly = trimmed.replace(/[^a-zA-ZÀ-ÿ]/g, '')
    if (lettersOnly.length < 7) return { valid: false, reason: `Mot trop court (${lettersOnly.length} lettres, min. 7)`, points: 0 }
  }

  return { valid: true, reason: 'Valide ✓', points: 2 }
}

export async function submitAnswers(roundId: string, answers: PlayerAnswers) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { data: round } = await supabase
    .from('rounds').select('status, letter').eq('id', roundId).single()

  if (!round || round.status === 'finished') return { error: 'Ce round est terminé.' }

  const rows = Object.entries(answers).map(([category_id, value]) => {
    const trimmed = (value ?? '').trim()
    const validation = validateAnswer(trimmed, round.letter, category_id)
    return {
      round_id: roundId,
      player_id: user.id,
      category_id,
      value: trimmed || null,
      is_valid: validation.valid,
    }
  })

  const { error } = await supabase
    .from('answers')
    .upsert(rows, { onConflict: 'round_id,player_id,category_id' })

  if (error) return { error: 'Impossible de soumettre les réponses.' }
  return { success: true }
}

export async function voteOnAnswer(answerId: string, isValid: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { data: answer } = await supabase
    .from('answers').select('player_id').eq('id', answerId).single()

  if (answer?.player_id === user.id) return { error: 'Tu ne peux pas voter sur ta propre réponse.' }

  const { error } = await supabase
    .from('votes')
    .upsert({ answer_id: answerId, voter_id: user.id, is_valid: isValid }, { onConflict: 'answer_id,voter_id' })

  if (error) return { error: "Impossible d'enregistrer le vote." }
  return { success: true }
}

export async function resolveAnswerValidity(roundId: string) {
  const supabase = await createClient()
  const { data: answers } = await supabase
    .from('answers').select('id, votes(is_valid)').eq('round_id', roundId)

  if (!answers) return { error: 'Aucune réponse trouvée.' }

  for (const answer of answers) {
    const votes = answer.votes as { is_valid: boolean }[]
    if (votes.length === 0) {
      await supabase.from('answers').update({ is_valid: true }).eq('id', answer.id)
      continue
    }
    const validCount = votes.filter((v) => v.is_valid).length
    const isValid = validCount >= Math.ceil(votes.length / 2)
    await supabase.from('answers').update({ is_valid: isValid }).eq('id', answer.id)
  }

  return { success: true }
}