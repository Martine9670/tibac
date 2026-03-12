import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CategoriesClient from '@/components/categories/CategoriesClient'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('is_default', { ascending: false })
    .order('name')

  return <CategoriesClient categories={categories ?? []} userId={user.id} />
}
