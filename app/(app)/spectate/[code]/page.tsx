import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SpectatorView from '@/components/game/SpectatorView'

interface Props { params: { code: string } }

export default async function SpectatorPage({ params }: Props) {
  const supabase = await createClient()

  const { data: room } = await supabase
    .from('rooms').select('*').eq('code', params.code.toUpperCase()).single()
  if (!room) notFound()

  const { data: currentRound } = await supabase
    .from('rounds').select('*').eq('room_id', room.id)
    .order('round_number', { ascending: false }).limit(1).single()

  const { data: players } = await supabase
    .from('room_players').select('*, profiles(username, avatar_url)').eq('room_id', room.id)

  const { data: roomCats } = await supabase
    .from('room_categories').select('categories(*)').eq('room_id', room.id)
  const categories = roomCats?.map((c: any) => c.categories) ?? []

  return (
    <SpectatorView
      room={room}
      initialRound={currentRound}
      initialPlayers={players ?? []}
      categories={categories}
    />
  )
}
