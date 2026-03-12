'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateRoomCode } from '@/lib/utils/index'
import type { CreateRoomForm } from '@/types/game.types'

export async function createRoom(form: CreateRoomForm) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const code = generateRoomCode()

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({ code, host_id: user.id, max_players: form.maxPlayers, round_count: form.roundCount, time_limit: form.timeLimit })
    .select().single()

  if (roomError || !room) return { error: 'Impossible de créer la salle. Réessaie.' }

  const categoryLinks = form.categoryIds.map((category_id) => ({ room_id: room.id, category_id }))
  const { error: catError } = await supabase.from('room_categories').insert(categoryLinks)
  if (catError) return { error: "Impossible d'associer les catégories." }

  const { error: playerError } = await supabase.from('room_players').insert({ room_id: room.id, player_id: user.id, is_ready: false })
  if (playerError) return { error: 'Impossible de rejoindre la salle.' }

  revalidatePath(`/lobby/${code}`)
  redirect(`/lobby/${code}`)
}

export async function joinRoom(code: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const { data: room, error: roomError } = await supabase
    .from('rooms').select('*').eq('code', code.toUpperCase()).eq('status', 'waiting').single()

  if (roomError || !room) return { error: 'Salle introuvable ou partie déjà commencée.' }

  const { count } = await supabase.from('room_players').select('*', { count: 'exact', head: true }).eq('room_id', room.id)
  if (count !== null && count >= room.max_players) return { error: 'La salle est pleine.' }

  const { error: joinError } = await supabase.from('room_players').upsert({ room_id: room.id, player_id: user.id, is_ready: false })
  if (joinError) return { error: 'Impossible de rejoindre la salle.' }

  revalidatePath(`/lobby/${code}`)
  redirect(`/lobby/${code}`)
}

export async function leaveRoom(roomId: string, code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('room_players').delete().eq('room_id', roomId).eq('player_id', user.id)

  const { data: room } = await supabase.from('rooms').select('host_id').eq('id', roomId).single()
  if (room?.host_id === user.id) await supabase.from('rooms').delete().eq('id', roomId)

  redirect('/lobby')
}

export async function setReady(roomId: string, isReady: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { error } = await supabase.from('room_players').update({ is_ready: isReady }).eq('room_id', roomId).eq('player_id', user.id)
  if (error) return { error: 'Impossible de mettre à jour le statut.' }
  return { success: true }
}
