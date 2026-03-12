import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from '@/components/profile/ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Historique des 10 dernières parties
  const { data: recentScores } = await supabase
    .from('scores')
    .select('*, rounds(letter, round_number, rooms(code, round_count))')
    .eq('player_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  // Stats globales
  const { data: allScores } = await supabase
    .from('scores')
    .select('points, bac_bonus')
    .eq('player_id', user.id)

  const totalPoints = allScores?.reduce((acc, s) => acc + s.points + s.bac_bonus, 0) ?? 0
  const totalBacs = allScores?.reduce((acc, s) => acc + s.bac_bonus, 0) ?? 0

  return (
    <ProfileClient
      profile={profile}
      recentScores={recentScores ?? []}
      totalPoints={totalPoints}
      totalBacs={totalBacs}
      userId={user.id}
    />
  )
}
