'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Appelé à la fin de chaque partie.
 * Met à jour total_score et games_played pour chaque joueur.
 */
export async function finalizeGame(roomId: string) {
  const supabase = await createClient()

  // Récupérer tous les rounds de la partie
  const { data: rounds } = await supabase
    .from('rounds')
    .select('id')
    .eq('room_id', roomId)

  if (!rounds || rounds.length === 0) return { error: 'Aucun round trouvé.' }

  const roundIds = rounds.map((r) => r.id)

  // Récupérer tous les scores
  const { data: scores } = await supabase
    .from('scores')
    .select('player_id, points, bac_bonus')
    .in('round_id', roundIds)

  if (!scores) return { error: 'Aucun score trouvé.' }

  // Agréger par joueur
  const playerTotals: Record<string, number> = {}
  for (const s of scores) {
    if (!playerTotals[s.player_id]) playerTotals[s.player_id] = 0
    playerTotals[s.player_id] += s.points + s.bac_bonus
  }

  // Mettre à jour chaque profil
  const updates = Object.entries(playerTotals).map(([player_id, pts]) =>
    supabase.rpc('increment_player_stats', { p_player_id: player_id, p_points: pts })
  )

  await Promise.all(updates)
  return { success: true }
}
