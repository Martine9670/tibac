'use client'

import { useState } from 'react'
import { joinRoom } from '@/lib/actions/room.actions'

export default function JoinRoomForm() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleJoin() {
    if (code.trim().length < 4) return
    setLoading(true)
    setError(null)

    const result = await joinRoom(code.trim())
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-zinc-400 text-sm">
        Entre le code de la salle partagé par ton ami.
      </p>

      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Code de la salle
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          placeholder="EX: BIG42"
          maxLength={6}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-mono tracking-widest uppercase"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleJoin}
        disabled={loading || code.trim().length < 4}
        className="w-full bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg py-2.5 text-sm transition-colors"
      >
        {loading ? 'Connexion...' : 'Rejoindre'}
      </button>
    </div>
  )
}
