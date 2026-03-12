'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 text-center gap-6">
      <div className="text-6xl">😵</div>
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Quelque chose s&apos;est planté</h2>
        <p className="text-zinc-400 text-sm max-w-sm">{error.message}</p>
      </div>
      <button
        onClick={reset}
        className="bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-bold px-6 py-3 rounded-xl transition-colors"
      >
        Réessayer
      </button>
    </main>
  )
}
