'use client'

import { useState } from 'react'
import { createRoom } from '@/lib/actions/room.actions'
import type { Category } from '@/types/game.types'

interface Props {
  categories: Category[]
}

export default function CreateRoomForm({ categories }: Props) {
  const allIds = categories.map((c) => c.id)
  const [selectedCats, setSelectedCats] = useState<string[]>(allIds)
  const [roundCount, setRoundCount] = useState(5)
  const [timeLimit, setTimeLimit] = useState(60)
  const [maxPlayers, setMaxPlayers] = useState(6)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  function toggleCategory(id: string) {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  function selectAll() { setSelectedCats(allIds) }
  function deselectAll() { setSelectedCats([]) }
  function selectFiltered() { setSelectedCats((prev) => [...new Set([...prev, ...filtered.map(c => c.id)])]) }
  function deselectFiltered() { setSelectedCats((prev) => prev.filter(id => !filtered.map(c => c.id).includes(id))) }

  async function handleSubmit() {
    if (selectedCats.length < 2) {
      setError('Sélectionne au moins 2 catégories.')
      return
    }
    setLoading(true)
    setError(null)
    const result = await createRoom({ categoryIds: selectedCats, roundCount, timeLimit, maxPlayers })
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* Catégories */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Catégories ({selectedCats.length}/{categories.length})
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={selectAll} className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">Tout</button>
            <span className="text-zinc-600">·</span>
            <button type="button" onClick={deselectAll} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Aucun</button>
          </div>
        </div>

        {/* Recherche */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Rechercher une catégorie..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-xs"
        />

        {search && (
          <div className="flex gap-2 text-xs">
            <button type="button" onClick={selectFiltered} className="text-yellow-400 hover:text-yellow-300">Sélectionner ces {filtered.length}</button>
            <span className="text-zinc-600">·</span>
            <button type="button" onClick={deselectFiltered} className="text-zinc-500 hover:text-zinc-300">Désélectionner ces {filtered.length}</button>
          </div>
        )}

        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {filtered.map((cat) => {
            const isSelected = selectedCats.includes(cat.id)
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm border transition-colors text-left ${
                  isSelected
                    ? 'bg-yellow-400/10 border-yellow-400/50 text-yellow-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                <span className="text-base shrink-0">{cat.emoji}</span>
                <span className="flex-1">{cat.name}</span>
                <span className={`shrink-0 font-bold ${isSelected ? 'text-yellow-400' : 'text-zinc-700'}`}>
                  {isSelected ? '✓' : '○'}
                </span>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-zinc-600 text-xs text-center py-4">Aucune catégorie trouvée</p>
          )}
        </div>
      </div>

      {/* Nombre de manches */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Nombre de manches</label>
        <div className="flex gap-2">
          {[3, 5, 7, 10].map((n) => (
            <button type="button" key={n} onClick={() => setRoundCount(n)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                roundCount === n ? 'bg-yellow-400 border-yellow-400 text-zinc-900' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Temps par manche */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Temps par manche</label>
        <div className="flex gap-2">
          {[30, 60, 90, 0].map((t) => (
            <button type="button" key={t} onClick={() => setTimeLimit(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                timeLimit === t ? 'bg-yellow-400 border-yellow-400 text-zinc-900' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}>
              {t === 0 ? '∞' : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Joueurs max */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Joueurs max</label>
        <div className="flex gap-2">
          {[2, 4, 6, 8].map((n) => (
            <button type="button" key={n} onClick={() => setMaxPlayers(n)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                maxPlayers === n ? 'bg-yellow-400 border-yellow-400 text-zinc-900' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <button type="button" onClick={handleSubmit} disabled={loading || selectedCats.length < 2}
        className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-900 font-bold rounded-lg py-2.5 text-sm transition-colors">
        {loading ? 'Création...' : `Créer la salle (${selectedCats.length} catégories)`}
      </button>
    </div>
  )
}