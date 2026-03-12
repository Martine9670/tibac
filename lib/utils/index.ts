// ============================================================
// letters.ts — Génération de lettres aléatoires
// ============================================================

// Lettres utilisables (sans Q, W, X, Y, Z — trop difficiles)
const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVB'.split('')
const EASY_LETTERS = 'ABCDEFGHILMNOPRSTUV'.split('')

export function getRandomLetter(exclude: string[] = [], easyMode = false): string {
  const pool = (easyMode ? EASY_LETTERS : LETTERS).filter(
    (l) => !exclude.includes(l)
  )
  if (pool.length === 0) return LETTERS[Math.floor(Math.random() * LETTERS.length)]
  return pool[Math.floor(Math.random() * pool.length)]
}

// ============================================================
// roomCode.ts — Génération du code de salle
// ============================================================

const ADJECTIVES = ['BIG', 'RED', 'HOT', 'ICY', 'SLY', 'ZEN', 'ODD', 'RAW']
const NOUNS = ['BAC', 'MOT', 'JEU', 'BAL', 'FEU', 'ROI', 'MER', 'AIR']

export function generateRoomCode(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const num = Math.floor(10 + Math.random() * 90) // 10–99
  return `${adj}${num}`
}

// ============================================================
// scoring.ts — Logique de calcul des points (côté client)
// ============================================================

import type { Answer, PlayerScore } from '@/types/game.types'

/**
 * Calcule les points pour un round donné.
 * - Réponse valide + unique   → 2 pts
 * - Réponse valide + partagée → 1 pt
 * - Réponse invalide / vide   → 0 pt
 */
export function computeRoundPoints(
  answers: Answer[],
  playerId: string
): number {
  const playerAnswers = answers.filter((a) => a.player_id === playerId)
  let total = 0

  for (const answer of playerAnswers) {
    if (!answer.is_valid || !answer.value) continue

    const sameAnswers = answers.filter(
      (a) =>
        a.category_id === answer.category_id &&
        a.is_valid &&
        a.value?.toLowerCase().trim() === answer.value?.toLowerCase().trim() &&
        a.player_id !== playerId
    )

    total += sameAnswers.length === 0 ? 2 : 1
  }

  return total
}

/**
 * Trie le classement final par score décroissant.
 */
export function sortLeaderboard(scores: PlayerScore[]): PlayerScore[] {
  return [...scores].sort((a, b) => b.total_points - a.total_points)
}
