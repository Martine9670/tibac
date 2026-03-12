export const dynamic = 'force-dynamic'

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-12 text-zinc-300">

        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-2">Mentions légales & RGPD</h1>
          <p className="text-zinc-500 text-sm">Dernière mise à jour : mars 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white border-b border-zinc-800 pb-3">1. Mentions légales</h2>
          <div className="space-y-2 text-sm leading-relaxed">
            <p><span className="text-zinc-400 font-medium">Éditeur du site :</span> Martine, particulier, Savoie, France</p>
            <p><span className="text-zinc-400 font-medium">Site web :</span> tibac.vercel.app</p>
            <p><span className="text-zinc-400 font-medium">Hébergeur :</span> Vercel Inc., 340 Pine Street Suite 701, San Francisco, CA 94104, États-Unis — <a href="https://vercel.com" className="text-yellow-400 hover:underline">vercel.com</a></p>
            <p><span className="text-zinc-400 font-medium">Base de données :</span> Supabase Inc. — <a href="https://supabase.com" className="text-yellow-400 hover:underline">supabase.com</a></p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white border-b border-zinc-800 pb-3">2. Données personnelles collectées</h2>
          <p className="text-sm leading-relaxed">Dans le cadre de l'utilisation de TIBAC, les données suivantes sont collectées :</p>
          <ul className="text-sm space-y-2 ml-4">
            <li className="flex gap-2"><span className="text-yellow-400">•</span><span><span className="font-medium text-white">Adresse email</span> — utilisée pour l'authentification et la récupération de compte.</span></li>
            <li className="flex gap-2"><span className="text-yellow-400">•</span><span><span className="font-medium text-white">Pseudo</span> — nom d'affichage choisi librement lors de l'inscription.</span></li>
            <li className="flex gap-2"><span className="text-yellow-400">•</span><span><span className="font-medium text-white">Avatar emoji</span> — choisi librement, aucune image réelle.</span></li>
            <li className="flex gap-2"><span className="text-yellow-400">•</span><span><span className="font-medium text-white">Données de jeu</span> — scores, réponses soumises, historique des parties.</span></li>
          </ul>
          <p className="text-sm leading-relaxed text-zinc-400">Aucune donnée de paiement, aucune donnée sensible, aucun cookie publicitaire ne sont collectés.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white border-b border-zinc-800 pb-3">3. Base légale du traitement</h2>
          <p className="text-sm leading-relaxed">Le traitement de vos données repose sur votre <span className="text-white font-medium">consentement explicite</span> lors de la création de votre compte. Vous pouvez retirer ce consentement à tout moment en supprimant votre compte.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white border-b border-zinc-800 pb-3">4. Durée de conservation</h2>
          <p className="text-sm leading-relaxed">Vos données sont conservées tant que votre compte est actif. En cas d'inactivité prolongée de plus de 24 mois, vos données pourront être supprimées. Vous pouvez demander la suppression à tout moment.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white border-b border-zinc-800 pb-3">6. Sécurité des données</h2>
          <p className="text-sm leading-relaxed">Les données sont stockées sur les serveurs de Supabase avec chiffrement en transit (HTTPS) et au repos. Les mots de passe sont hachés et ne sont jamais stockés en clair. L'accès aux données est contrôlé par des politiques de sécurité strictes (Row Level Security).</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white border-b border-zinc-800 pb-3">7. Cookies</h2>
          <p className="text-sm leading-relaxed">TIBAC utilise uniquement des cookies techniques strictement nécessaires au fonctionnement de l'authentification (session utilisateur). Aucun cookie publicitaire ou de tracking n'est utilisé.</p>
        </section>

        <div className="text-center pt-8 border-t border-zinc-800">
          <a href="/" className="text-yellow-400 hover:underline text-sm">← Retour à l'accueil</a>
        </div>

      </div>
    </main>
  )
}