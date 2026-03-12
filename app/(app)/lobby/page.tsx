import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreateRoomForm from '@/components/lobby/CreateRoomForm'
import JoinRoomForm from '@/components/lobby/JoinRoomForm'

export default async function LobbyPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_default', true)
    .order('name')
    console.log('categories from DB:', categories)

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-tight">🎲 TIBAC</h1>
          <p className="mt-1 text-zinc-400 text-sm">
            Bonjour <span className="text-yellow-400 font-semibold">{profile?.username}</span> !
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Créer une salle */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Créer une salle</h2>
            <CreateRoomForm categories={categories ?? []} />
          </div>

          {/* Rejoindre une salle */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Rejoindre une salle</h2>
            <JoinRoomForm />
          </div>
        </div>

      </div>
    </main>
  )
}
