import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GameOrchestrator from '@/components/game/GameOrchestrator'

interface Props { params: { code: string } }

export default async function GamePage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single()

  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', params.code.toUpperCase())
    .single()

  if (!room) notFound()
  if (room.status === 'waiting') redirect(`/lobby/${params.code}`)
  if (room.status === 'finished') redirect(`/game/${params.code}/results`)

  const { data: currentRound } = await supabase
    .from('rounds')
    .select('*')
    .eq('room_id', room.id)
    .order('round_number', { ascending: false })
    .limit(1)
    .single()

  const { data: players } = await supabase
    .from('room_players')
    .select('*, profiles(username, avatar_url)')
    .eq('room_id', room.id)

  const { data: roomCats } = await supabase
    .from('room_categories')
    .select('categories(*)')
    .eq('room_id', room.id)

  const categories = roomCats?.map((c: any) => c.categories) ?? []

  const roundIds = (await supabase.from('rounds').select('id').eq('room_id', room.id)).data?.map(r => r.id) ?? []
  const { data: scores } = await supabase
    .from('scores')
    .select('*, profiles(username, avatar_url)')
    .in('round_id', roundIds)

  return (
    <GameOrchestrator
      room={room}
      initialRound={currentRound}
      initialPlayers={players ?? []}
      categories={categories}
      currentUserId={user.id}
      currentUsername={profile?.username ?? 'Joueur'}
      initialScores={scores ?? []}
    />
  )
}
