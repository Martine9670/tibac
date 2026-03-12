'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function updateProfile({
  username,
  avatar_url,
}: {
  username: string
  avatar_url: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  if (username.length < 2) return { error: 'Pseudo trop court.' }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .single()

  if (existing) return { error: 'Ce pseudo est déjà pris.' }

  const { error } = await supabase
    .from('profiles')
    .update({ username, avatar_url })
    .eq('id', user.id)

  if (error) return { error: 'Impossible de mettre à jour le profil.' }

  revalidatePath('/profile')
  return { success: true }
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const userId = user.id

  // Supprimer les données du joueur
  await supabase.from('scores').delete().eq('player_id', userId)
  await supabase.from('answers').delete().eq('player_id', userId)
  await supabase.from('votes').delete().eq('voter_id', userId)
  await supabase.from('room_players').delete().eq('player_id', userId)
  await supabase.from('profiles').delete().eq('id', userId)

  // Supprimer l'utilisateur auth avec la clé service_role
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) return { error: 'Impossible de supprimer le compte.' }

  return { success: true }
}