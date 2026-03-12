import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WaitingRoom from '@/components/lobby/WaitingRoom'

interface Props { params: { code: string } }

export default async function LobbyRoomPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('username').eq('id', user.id).single()

  const { data: room } = await supabase
    .from('rooms').select('*').eq('code', params.code.toUpperCase()).single()

  if (!room) notFound()
  if (room.status === 'playing') redirect(`/game/${params.code}`)
  if (room.status === 'finished') redirect('/lobby')

  const { data: players } = await supabase
    .from('room_players').select('*, profiles(username, avatar_url)').eq('room_id', room.id)

  const { data: categories } = await supabase
    .from('room_categories').select('categories(*)').eq('room_id', room.id)

  const flatCategories = categories?.map((c: any) => c.categories) ?? []

  return (
    <WaitingRoom
      room={room}
      initialPlayers={players ?? []}
      categories={flatCategories}
      currentUserId={user.id}
      currentUsername={profile?.username ?? 'Joueur'}
    />
  )
}
