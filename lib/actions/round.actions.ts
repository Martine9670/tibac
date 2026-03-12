'use server'

import { createClient } from '@/lib/supabase/server'
import { getRandomLetter } from '@/lib/utils/index'
import { redirect } from 'next/navigation'
import { finalizeGame } from './game.actions'

export async function startGame(roomId: string, code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }
  const { data: room } = await supabase.from('rooms').select('host_id').eq('id', roomId).single()
  if (room?.host_id !== user.id) return { error: "Seul l'hôte peut démarrer." }
  await supabase.from('rooms').update({ status: 'playing' }).eq('id', roomId)
  const { error } = await supabase.from('rounds').insert({ room_id: roomId, round_number: 1, letter: getRandomLetter(), status: 'active' })
  if (error) return { error: 'Impossible de démarrer.' }
  redirect(`/game/${code}`)
}

export async function callBac(roundId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }
  const { data: round } = await supabase.from('rounds').select('status, winner_id').eq('id', roundId).single()
  if (round?.status !== 'active') return { error: 'Round déjà terminé.' }
  if (round?.winner_id) return { error: 'BAC déjà appelé !' }
  const { error } = await supabase.from('rounds')
    .update({ winner_id: user.id, status: 'voting', ended_at: new Date().toISOString() })
    .eq('id', roundId).eq('status', 'active')
  if (error) return { error: "Impossible d'appeler BAC." }
  await supabase.from('scores').upsert(
    { round_id: roundId, player_id: user.id, points: 0, bac_bonus: 1 },
    { onConflict: 'round_id,player_id', ignoreDuplicates: false }
  )
  return { success: true }
}

export async function finishVoting(roundId: string, soloScores?: Record<string, number>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  if (soloScores) {
    // Mode solo : sauvegarder les scores validés côté client
    const totalPoints = Object.values(soloScores).reduce((acc, p) => acc + p, 0)
    await supabase.from('scores').upsert(
      { round_id: roundId, player_id: user.id, points: totalPoints, bac_bonus: 0 },
      { onConflict: 'round_id,player_id' }
    )
  } else {
    // Mode multijoueur : calculer via SQL
    const { error } = await supabase.rpc('compute_round_scores', { p_round_id: roundId })
    if (error) return { error: 'Erreur calcul scores.' }
  }

  await supabase.from('rounds').update({ status: 'finished' }).eq('id', roundId)
  return { success: true }
}

export async function nextRound(roomId: string, currentRoundNumber: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }
  const { data: room } = await supabase.from('rooms').select('host_id, round_count').eq('id', roomId).single()
  if (room?.host_id !== user.id) return { error: "Seul l'hôte peut continuer." }
  const nextNum = currentRoundNumber + 1
  if (nextNum > (room?.round_count ?? 5)) {
    await supabase.from('rooms').update({ status: 'finished' }).eq('id', roomId)
    await finalizeGame(roomId)
    return { finished: true }
  }
  const { data: usedLetters } = await supabase.from('rounds').select('letter').eq('room_id', roomId)
  const used = usedLetters?.map((r) => r.letter) ?? []
  const { error } = await supabase.from('rounds').insert({ room_id: roomId, round_number: nextNum, letter: getRandomLetter(used), status: 'active' })
  if (error) return { error: 'Impossible de créer le round.' }
  return { success: true }
}