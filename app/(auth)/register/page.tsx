'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleRegister() {
    setLoading(true)
    setError(null)

    if (username.trim().length < 2) {
      setError('Le pseudo doit contenir au moins 2 caractères.')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim())
      .single()

    if (existing) {
      setError('Ce pseudo est déjà pris.')
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="text-6xl">📬</div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Vérifie ta boîte mail !</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Un email de confirmation a été envoyé à <span className="text-yellow-400 font-medium">{email}</span>.
              <br /><br />
              Clique sur le lien dans l'email pour activer ton compte, puis connecte-toi.
            </p>
          </div>
          <Link href="/login"
            className="inline-block w-full bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-bold rounded-xl py-3 text-sm transition-colors">
            Aller à la connexion →
          </Link>
          <p className="text-zinc-600 text-xs">Tu n'as pas reçu l'email ? Vérifie tes spams.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight text-white">🎲 TIBAC</h1>
          <p className="mt-2 text-zinc-400 text-sm">Crée ton compte pour jouer</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Pseudo</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="MonPseudo" maxLength={20}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.fr"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm" />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <button onClick={handleRegister} disabled={loading || !email || !password || !username}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-900 font-bold rounded-lg py-2.5 text-sm transition-colors">
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </div>

        <p className="text-center text-zinc-500 text-sm">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-yellow-400 hover:underline font-medium">Se connecter</Link>
        </p>
      </div>
    </main>
  )
}