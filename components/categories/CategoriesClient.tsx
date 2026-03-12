'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory, deleteCategory } from '@/lib/actions/category.actions'
import { useToast } from '@/lib/hooks/useToast'
import type { Category } from '@/types/game.types'

const EMOJI_OPTIONS = ['🏆', '🎵', '🌺', '🏖️', '🍕', '⚽', '🚗', '🎬', '📚', '🎨', '🧪', '💎', '🌙', '🔥', '❄️', '🎭']

interface Props {
  categories: Category[]
  userId: string
}

export default function CategoriesClient({ categories, userId }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🏆')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const defaultCats = categories.filter((c) => c.is_default)
  const customCats = categories.filter((c) => !c.is_default)

  async function handleCreate() {
    if (!name.trim()) return
    setCreating(true)
    const result = await createCategory({ name: name.trim(), emoji })
    setCreating(false)
    if (result?.error) {
      toast({ type: 'error', message: result.error })
    } else {
      toast({ type: 'success', message: `Catégorie "${name}" créée !` })
      setName('')
      setShowForm(false)
      router.refresh()
    }
  }

  async function handleDelete(id: string, catName: string) {
    const result = await deleteCategory(id)
    if (result?.error) {
      toast({ type: 'error', message: result.error })
    } else {
      toast({ type: 'success', message: `"${catName}" supprimée.` })
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Catégories</h1>
            <p className="text-zinc-500 text-sm">Gère les catégories disponibles dans tes parties</p>
          </div>
          <button
            onClick={() => router.push('/lobby')}
            className="text-zinc-500 hover:text-white text-sm transition-colors"
          >
            ← Lobby
          </button>
        </div>

        {/* Catégories par défaut */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Catégories par défaut ({defaultCats.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {defaultCats.map((cat) => (
              <span key={cat.id} className="flex items-center gap-1.5 bg-zinc-800 text-zinc-300 text-sm px-3 py-1.5 rounded-full border border-zinc-700">
                {cat.emoji} {cat.name}
              </span>
            ))}
          </div>
        </div>

        {/* Catégories custom */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Mes catégories ({customCats.length})
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold transition-colors"
            >
              {showForm ? '✕ Annuler' : '+ Ajouter'}
            </button>
          </div>

          {/* Formulaire création */}
          {showForm && (
            <div className="bg-zinc-800 rounded-xl p-4 space-y-3 animate-in">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Emoji</label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`text-xl w-9 h-9 rounded-lg transition-all ${
                        emoji === e ? 'bg-yellow-400/20 ring-2 ring-yellow-400' : 'bg-zinc-700 hover:bg-zinc-600'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Nom</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="Ex: Personnage célèbre"
                  maxLength={30}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-zinc-500"
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={creating || !name.trim()}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-900 font-bold rounded-lg py-2 text-sm transition-colors"
              >
                {creating ? 'Création...' : `Créer ${emoji} ${name || '...'}`}
              </button>
            </div>
          )}

          {customCats.length === 0 && !showForm && (
            <p className="text-zinc-600 text-sm italic text-center py-4">
              Aucune catégorie custom. Clique sur + pour en créer !
            </p>
          )}

          <div className="space-y-2">
            {customCats.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <span className="text-white text-sm">
                  {cat.emoji} {cat.name}
                </span>
                {cat.created_by === userId && (
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="text-zinc-600 hover:text-red-400 text-xs transition-colors px-2 py-1"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
