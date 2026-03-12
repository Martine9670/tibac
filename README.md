# 🎲 Petit Bac

Jeu du Petit Bac multijoueur en temps réel, construit avec **Next.js 14**, **Supabase** et **Tailwind CSS**.

---

## Stack

| Technologie | Usage |
|-------------|-------|
| Next.js 14 (App Router) | Frontend + Server Actions |
| React 18 | UI |
| Supabase Auth | Authentification |
| Supabase DB (PostgreSQL) | Stockage des parties |
| Supabase Realtime | Synchronisation temps réel |
| Zustand | State management client |
| Tailwind CSS | Styles |
| TypeScript | Typage |

---

## Démarrage rapide

### 1. Cloner et installer

```bash
git clone <repo>
cd petit-bac
npm install
```

### 2. Configurer Supabase

Crée un projet sur [supabase.com](https://supabase.com), puis :

```bash
cp .env.local.example .env.local
# Remplis NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Appliquer le schéma SQL

Dans l'éditeur SQL de Supabase, colle et exécute le contenu de `petit-bac-schema.sql`.

### 4. Générer les types TypeScript

```bash
npm install -g supabase
supabase login
supabase link --project-ref <ton-project-ref>
npm run types
```

### 5. Lancer en dev

```bash
npm run dev
# → http://localhost:3000
```

---

## Structure du projet

```
app/
├── (auth)/login        # Connexion
├── (auth)/register     # Inscription
├── lobby/              # Créer / rejoindre une salle
├── lobby/[code]/       # Salle d'attente
└── game/[code]/        # Jeu en cours
    └── results/        # Résultats finaux

components/
├── lobby/              # CreateRoomForm, JoinRoomForm, WaitingRoom
└── game/               # GameOrchestrator, LetterReveal, PlayingPhase,
                        # VotingPhase, RoundSummary, ScoreBoard, Timer

lib/
├── supabase/           # Clients browser/server + middleware
├── stores/             # Zustand : gameStore, userStore
├── actions/            # Server Actions : room, round, answer
├── hooks/              # Realtime : useRoom, usePlayers, useRound...
└── utils/              # letters, roomCode, scoring
```

---

## Flux de jeu

```
/login ou /register
       ↓
/lobby  →  Créer une salle  →  /lobby/[CODE]  (salle d'attente)
       →  Rejoindre (code)  →  /lobby/[CODE]

/lobby/[CODE]  →  Hôte démarre  →  /game/[CODE]
       ↓
  Révélation lettre  →  Saisie réponses  →  BAC !
       ↓
  Phase de vote  →  Résumé manche  →  (manche suivante ou fin)
       ↓
  /game/[CODE]/results
```

---

## Déploiement (Vercel)

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Ajouter les variables d'environnement dans le dashboard Vercel :
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Règles du jeu

- Une **lettre** est tirée au hasard à chaque manche
- Chaque joueur remplit les catégories avec un mot commençant par cette lettre
- Le premier à tout remplir crie **BAC !** — les autres arrêtent d'écrire
- **Vote** : les joueurs valident ou invalident les réponses des autres
- **Scoring** :
  - Réponse valide et unique → **2 points**
  - Réponse valide et partagée → **1 point**
  - Réponse invalide ou vide → **0 point**
  - Bonus BAC → **+1 point**
