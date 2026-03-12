'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCategory({ name, emoji }: { name: string; emoji: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { error } = await supabase
    .from('categories')
    .insert({ name, emoji, is_default: false, created_by: user.id })

  if (error) return { error: 'Impossible de créer la catégorie.' }
  revalidatePath('/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id) // sécurité : ne peut supprimer que les siennes

  if (error) return { error: 'Impossible de supprimer la catégorie.' }
  revalidatePath('/categories')
  return { success: true }
}
