'use server'

import { createClient } from '@/lib/supabase/server'
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

  // Vérifier unicité du pseudo (sauf le sien)
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
