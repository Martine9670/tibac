import Link from 'next/link'

export default function LandingPage() {
  const features = [
    { emoji: '⚡', title: 'Temps réel', desc: 'Synchronisation instantanée entre tous les joueurs grâce à Supabase Realtime.' },
    { emoji: '🎯', title: 'Vote collectif', desc: 'Les réponses sont validées par vote majoritaire pour plus de fun.' },
    { emoji: '🏆', title: 'Classement live', desc: 'Scores mis à jour en direct après chaque manche.' },
    { emoji: '🎨', title: 'Catégories custom', desc: 'Crée tes propres catégories pour personnaliser chaque partie.' },
    { emoji: '🛑', title: 'Bouton BAC!', desc: 'Crie BAC en premier pour gagner un bonus et arrêter la manche.' },
    { emoji: '📱', title: 'Mobile-first', desc: 'Joue depuis ton téléphone, tablette ou ordinateur.' },
  ]

  return (
    <main className="min-h-screen bg-zinc-950 overflow-hidden">

      {/* Hero */}
      <section className="relative px-4 pt-24 pb-20 text-center">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            🎲 Le Petit Bac en ligne est arrivé
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-4">
            Petit<br />
            <span className="text-gradient">Bac</span>
          </h1>

          <p className="text-zinc-400 text-lg max-w-md mx-auto mb-10">
            Le jeu classique de mots, en multijoueur temps réel. Crée une salle, invite tes amis, et que le meilleur gagne.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-black px-8 py-4 rounded-2xl text-lg transition-all hover:scale-105 active:scale-95 glow-yellow"
            >
              Jouer maintenant →
            </Link>
            <Link
              href="/login"
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Demo letters */}
      <section className="px-4 py-8">
        <div className="max-w-2xl mx-auto flex justify-center gap-3 flex-wrap">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((l, i) => (
            <div
              key={l}
              className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-2xl font-black text-zinc-600 hover:text-yellow-400 hover:border-yellow-400/30 transition-all cursor-default"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {l}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-white text-center mb-10">Comment jouer</h2>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Crée une salle', desc: 'Choisis tes catégories, le nombre de manches et invite tes amis avec un code.' },
              { step: '02', title: 'Une lettre est tirée', desc: 'Une lettre aléatoire apparaît — tu as X secondes pour remplir toutes les catégories.' },
              { step: '03', title: 'Crie BAC !', desc: 'Le premier à terminer crie BAC ! et tout le monde s\'arrête. Bonus +1 point pour le vainqueur.' },
              { step: '04', title: 'Vote collectif', desc: 'Chaque joueur valide ou invalide les réponses des autres. Réponse unique = 2pts, partagée = 1pt.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <span className="text-yellow-400 font-black text-2xl shrink-0 w-10">{step}</span>
                <div>
                  <p className="text-white font-bold mb-1">{title}</p>
                  <p className="text-zinc-400 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-4 py-16 bg-zinc-900/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-white text-center mb-10">Fonctionnalités</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-3xl mb-3">{f.emoji}</p>
                <p className="text-white font-bold mb-1">{f.title}</p>
                <p className="text-zinc-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 py-20 text-center">
        <h2 className="text-4xl font-black text-white mb-4">Prêt à jouer ?</h2>
        <p className="text-zinc-400 mb-8">Gratuit, sans téléchargement, juste du fun.</p>
        <Link
          href="/register"
          className="inline-block bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-black px-10 py-4 rounded-2xl text-xl transition-all hover:scale-105"
        >
          Créer mon compte 🎲
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-4 py-6 text-center text-zinc-600 text-sm">
        Petit Bac — Fait avec ❤️ et Next.js
      </footer>

    </main>
  )
}
