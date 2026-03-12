'use client'

/**
 * Valide une réponse côté client avant soumission.
 * - La valeur doit commencer par la bonne lettre (insensible à la casse)
 * - La valeur ne doit pas être vide (sauf si le joueur veut passer)
 */
export function validateAnswer(value: string, letter: string): boolean {
  if (!value.trim()) return true // vide = accepté (0 point)
  return value.trim().toUpperCase().startsWith(letter.toUpperCase())
}

/**
 * Retourne un message d'erreur si la réponse est invalide.
 */
export function getAnswerError(value: string, letter: string): string | null {
  if (!value.trim()) return null
  if (!validateAnswer(value, letter)) {
    return `La réponse doit commencer par la lettre "${letter}"`
  }
  return null
}
