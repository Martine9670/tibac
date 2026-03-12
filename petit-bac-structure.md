# 🎲 Petit Bac — Structure du projet Next.js

## Stack
- **Next.js 14** (App Router)
- **React 18**
- **Supabase** (Auth + DB + Realtime)
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** (state management)
- **TypeScript**

---

## Arborescence complète

```
petit-bac/
├── app/                              # App Router Next.js 14
│   ├── layout.tsx                    # Layout racine (fonts, providers)
│   ├── page.tsx                      # Page d'accueil (login / join / create)
│   ├── globals.css
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx            # Connexion
│   │   └── register/page.tsx         # Inscription
│   │
│   ├── lobby/
│   │   ├── page.tsx                  # Créer une salle
│   │   └── [code]/
│   │       └── page.tsx              # Salle d'attente (avec code d'invitation)
│   │
│   ├── game/
│   │   └── [code]/
│   │       ├── page.tsx              # Page principale du jeu
│   │       ├── round/
│   │       │   └── [roundId]/
│   │       │       └── page.tsx      # Manche en cours
│   │       └── results/
│   │           └── page.tsx          # Résultats finaux
│   │
│   └── profile/
│       └── page.tsx                  # Profil joueur & historique
│
├── components/
│   ├── ui/                           # shadcn/ui (Button, Input, Card...)
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   │
│   ├── lobby/
│   │   ├── CreateRoomForm.tsx        # Choix catégories, nb rounds, timer
│   │   ├── JoinRoomForm.tsx          # Saisie du code
│   │   ├── PlayerList.tsx            # Liste joueurs connectés (realtime)
│   │   └── ReadyButton.tsx           # Bouton "Prêt !"
│   │
│   ├── game/
│   │   ├── LetterReveal.tsx          # Animation révélation de la lettre
│   │   ├── AnswerGrid.tsx            # Grille de réponses (catégories × joueur)
│   │   ├── AnswerInput.tsx           # Champ de saisie par catégorie
│   │   ├── BacButton.tsx             # Bouton "BAC !" (gros, animé)
│   │   ├── Timer.tsx                 # Compte à rebours
│   │   ├── VotingPhase.tsx           # Phase de vote sur les réponses
│   │   ├── ScoreBoard.tsx            # Tableau des scores en temps réel
│   │   └── RoundSummary.tsx          # Récap après chaque manche
│   │
│   └── shared/
│       ├── Avatar.tsx
│       ├── PlayerBadge.tsx
│       └── LoadingSpinner.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # createBrowserClient()
│   │   ├── server.ts                 # createServerClient() (Server Components)
│   │   └── middleware.ts             # Auth middleware
│   │
│   ├── hooks/
│   │   ├── useRoom.ts                # Realtime subscription sur rooms
│   │   ├── useRound.ts               # Realtime subscription sur rounds
│   │   ├── usePlayers.ts             # Realtime subscription sur room_players
│   │   ├── useAnswers.ts             # Soumission & lecture des réponses
│   │   ├── useVoting.ts              # Phase de vote
│   │   └── useScores.ts              # Scores en temps réel
│   │
│   ├── stores/
│   │   ├── gameStore.ts              # Zustand : état global du jeu
│   │   └── userStore.ts              # Zustand : utilisateur connecté
│   │
│   ├── actions/
│   │   ├── room.actions.ts           # Server Actions : créer/rejoindre salle
│   │   ├── round.actions.ts          # Server Actions : démarrer manche, appeler BAC
│   │   ├── answer.actions.ts         # Server Actions : soumettre réponses
│   │   └── vote.actions.ts           # Server Actions : voter sur réponses
│   │
│   └── utils/
│       ├── letters.ts                # Génération lettre aléatoire
│       ├── scoring.ts                # Logique calcul des points
│       └── roomCode.ts               # Génération code salle (ex: "BAC42")
│
├── types/
│   ├── database.types.ts             # Types auto-générés par Supabase CLI
│   ├── game.types.ts                 # Types métier (Room, Round, Answer...)
│   └── supabase.ts                   # Re-exports utiles
│
├── middleware.ts                     # Protect routes (auth guard)
│
├── .env.local
│   # NEXT_PUBLIC_SUPABASE_URL=
│   # NEXT_PUBLIC_SUPABASE_ANON_KEY=
│
└── supabase/
    ├── migrations/
    │   └── 001_init.sql              # Le schema complet (voir petit-bac-schema.sql)
    └── seed.sql                      # Catégories par défaut
```

---

## Flux de jeu (pages → composants)

```
/ (accueil)
 ├── → /register ou /login
 ├── → /lobby             (créer une salle)
 └── → /lobby/[code]      (rejoindre via code)
         ↓ host démarre
/game/[code]              (orchestrateur realtime)
 ├── LetterReveal          (nouvelle lettre animée)
 ├── /game/[code]/round/[id]
 │    ├── Timer
 │    ├── AnswerGrid + AnswerInput
 │    └── BacButton  → déclenche fin de round
 ├── VotingPhase           (vote sur les réponses)
 ├── RoundSummary          (scores du round)
 └── /game/[code]/results  (fin de partie)
```

---

## Realtime Channels Supabase

| Channel                   | Table          | Événement                        |
|---------------------------|----------------|----------------------------------|
| `room:{code}`             | `rooms`        | Changement de status             |
| `players:{roomId}`        | `room_players` | Joueur rejoint / quitte          |
| `round:{roomId}`          | `rounds`       | Nouvelle manche, BAC appelé      |
| `answers:{roundId}`       | `answers`      | Réponses soumises                |
| `scores:{roomId}`         | `scores`       | Scores mis à jour                |

---

## Commandes pour démarrer

```bash
# 1. Créer le projet
npx create-next-app@latest petit-bac --typescript --tailwind --app

# 2. Installer les dépendances
cd petit-bac
npm install @supabase/supabase-js @supabase/ssr zustand
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
npx shadcn-ui@latest init

# 3. Installer Supabase CLI et lier le projet
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>

# 4. Générer les types TypeScript depuis Supabase
supabase gen types typescript --linked > types/database.types.ts

# 5. Appliquer le schema
supabase db push
```

---

## Variables d'environnement (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
