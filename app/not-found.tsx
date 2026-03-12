import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 text-center gap-6">
      <div className="text-8xl">🤔</div>
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Page introuvable</h1>
        <p className="text-zinc-400">Cette page n&apos;existe pas ou a été supprimée.</p>
      </div>
      <Link
        href="/"
        className="bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-bold px-6 py-3 rounded-xl transition-colors"
      >
        ← Retour à l&apos;accueil
      </Link>
    </main>
  )
}
