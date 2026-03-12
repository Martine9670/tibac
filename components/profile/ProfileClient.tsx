'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/lib/actions/profile.actions'
import { useToast } from '@/lib/hooks/useToast'

interface Props {
  profile: any
  recentScores: any[]
  totalPoints: number
  totalBacs: number
  userId: string
}

const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🐯', '🦋', '🐙', '🦄', '🐺', '🦅', '🐲', '🎭']

export default function ProfileClient({ profile, recentScores, totalPoints, totalBacs, userId }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  const [currentProfile, setCurrentProfile] = useState(profile)
  const [username, setUsername] = useState(currentProfile?.username ?? '')
  const [selectedEmoji, setSelectedEmoji] = useState(currentProfile?.avatar_url ?? '🦊')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setCurrentProfile(profile)
  }, [profile])

  async function handleSave() {
    setSaving(true)
    const trimmedUsername = username.trim()
    const result = await updateProfile({ username: trimmedUsername, avatar_url: selectedEmoji })
    setSaving(false)
    if (result?.error) {
      toast({ type: 'error', message: result.error })
    } else {
      toast({ type: 'success', message: 'Profil mis à jour !' })
      setCurrentProfile((p: any) => ({ ...p, username: trimmedUsername, avatar_url: selectedEmoji }))
      setEditing(false)
      router.refresh()
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    const supabase = createClient()
    // Supprimer les données du joueur
    await supabase.from('scores').delete().eq('player_id', userId)
    await supabase.from('answers').delete().eq('player_id', userId)
    await supabase.from('votes').delete().eq('voter_id', userId)
    await supabase.from('room_players').delete().eq('player_id', userId)
    await supabase.from('profiles').delete().eq('id', userId)
    await supabase.auth.signOut()
    router.push('/')
  }

  const games = useMemo(() => {
    const gameMap = new Map<string, { code: string; rounds: number; pts: number; letter: string }>()
    for (const s of recentScores) {
      const code = s.rounds?.rooms?.code ?? '???'
      if (!gameMap.has(code)) {
        gameMap.set(code, { code, rounds: s.rounds?.rooms?.round_count ?? 0, pts: 0, letter: s.rounds?.letter ?? '?' })
      }
      const entry = gameMap.get(code)!
      entry.pts += (s.points ?? 0) + (s.bac_bonus ?? 0)
    }
    return Array.from(gameMap.values()).slice(0, 8)
  }, [recentScores])

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">Mon profil</h1>
          <button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 text-sm transition-colors">
            Déconnexion →
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Choisis ton avatar</p>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((emoji) => (
                    <button type="button" key={emoji} onClick={() => setSelectedEmoji(emoji)}
                      className={`text-3xl h-12 rounded-xl transition-all ${selectedEmoji === emoji ? 'bg-yellow-400/20 ring-2 ring-yellow-400 scale-110' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Pseudo</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={20}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-900 font-bold rounded-xl py-2.5 text-sm transition-colors">
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button onClick={() => setEditing(false)}
                  className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl py-2.5 text-sm transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-5xl w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center">
                {currentProfile?.avatar_url ?? '🦊'}
              </div>
              <div className="flex-1">
                <p className="text-white font-black text-xl">{currentProfile?.username}</p>
                <p className="text-zinc-500 text-sm">Joueur TIBAC</p>
              </div>
              <button onClick={() => { setUsername(currentProfile?.username ?? ''); setSelectedEmoji(currentProfile?.avatar_url ?? '🦊'); setEditing(true) }}
                className="text-zinc-500 hover:text-yellow-400 text-sm transition-colors border border-zinc-700 hover:border-yellow-400/50 px-3 py-1.5 rounded-lg">
                ✏️ Modifier
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Points totaux', value: totalPoints, emoji: '⭐' },
            { label: 'Parties jouées', value: currentProfile?.games_played ?? 0, emoji: '🎮' },
            { label: 'BAC ! criés', value: totalBacs, emoji: '🛑' },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">{stat.emoji}</p>
              <p className="text-yellow-400 font-black text-2xl">{stat.value}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Dernières parties</p>
          {games.length === 0 ? (
            <p className="text-zinc-600 text-sm italic text-center py-4">Aucune partie jouée pour l&apos;instant.</p>
          ) : (
            <div className="space-y-2">
              {games.map((game, i) => (
                <div key={game.code} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600 text-xs w-4">{i + 1}.</span>
                    <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-yellow-400 font-black text-sm">{game.letter}</div>
                    <div>
                      <p className="text-white text-sm font-medium">Salle {game.code}</p>
                      <p className="text-zinc-600 text-xs">{game.rounds} manches</p>
                    </div>
                  </div>
                  <span className="text-yellow-400 font-black">{game.pts} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => router.push('/lobby')}
          className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold rounded-xl py-3 text-sm transition-colors">
          ← Retour au lobby
        </button>

        {/* Suppression de compte */}
        <div className="border border-red-500/20 rounded-2xl p-4 space-y-3">
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="w-full border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 font-medium rounded-xl py-2.5 text-sm transition-colors">
              🗑️ Supprimer mon compte
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-red-400 text-sm text-center">⚠️ Cette action est irréversible. Toutes vos données seront supprimées.</p>
              <div className="flex gap-2">
                <button onClick={handleDeleteAccount} disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-bold rounded-xl py-2.5 text-sm transition-colors">
                  {deleting ? 'Suppression...' : 'Confirmer la suppression'}
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl py-2.5 text-sm transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}