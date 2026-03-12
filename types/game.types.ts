// ============================================================
// Types métier — Petit Bac
// ============================================================

export type RoomStatus = 'waiting' | 'playing' | 'finished'
export type RoundStatus = 'active' | 'voting' | 'finished'

// ---- Profile -----------------------------------------------
export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  total_score: number
  games_played: number
  created_at: string
  updated_at: string
}

// ---- Category ----------------------------------------------
export interface Category {
  id: string
  name: string
  emoji: string | null
  is_default: boolean
  created_by: string | null
}

// ---- Room --------------------------------------------------
export interface Room {
  id: string
  code: string
  host_id: string
  status: RoomStatus
  max_players: number
  round_count: number
  time_limit: number        // secondes (0 = illimité)
  created_at: string
  updated_at: string
}

export interface RoomWithPlayers extends Room {
  players: RoomPlayer[]
  categories: Category[]
}

// ---- RoomPlayer --------------------------------------------
export interface RoomPlayer {
  id: string
  room_id: string
  player_id: string
  is_ready: boolean
  is_online: boolean
  joined_at: string
  profile?: Profile
}

// ---- Round -------------------------------------------------
export interface Round {
  id: string
  room_id: string
  round_number: number
  letter: string
  status: RoundStatus
  started_at: string
  ended_at: string | null
  winner_id: string | null
}

// ---- Answer ------------------------------------------------
export interface Answer {
  id: string
  round_id: string
  player_id: string
  category_id: string
  value: string | null
  is_valid: boolean | null
  submitted_at: string
}

// Réponses d'un joueur pour un round, groupées par catégorie
export type PlayerAnswers = Record<string, string>  // { [category_id]: value }

// ---- Vote --------------------------------------------------
export interface Vote {
  id: string
  answer_id: string
  voter_id: string
  is_valid: boolean
  created_at: string
}

// ---- Score -------------------------------------------------
export interface Score {
  id: string
  round_id: string
  player_id: string
  points: number
  bac_bonus: number
  created_at: string
}

// Score agrégé toutes manches confondues
export interface PlayerScore {
  player_id: string
  username: string
  avatar_url: string | null
  total_points: number
  rounds: { round_number: number; points: number; bac_bonus: number }[]
}

// ---- Game State (Zustand) ----------------------------------
export interface GameState {
  room: Room | null
  players: RoomPlayer[]
  categories: Category[]
  currentRound: Round | null
  answers: Answer[]
  scores: PlayerScore[]
  phase: 'lobby' | 'letter-reveal' | 'playing' | 'voting' | 'round-summary' | 'finished'
}

// ---- Forms -------------------------------------------------
export interface CreateRoomForm {
  categoryIds: string[]
  roundCount: number        // 3 | 5 | 7 | 10
  timeLimit: number         // 30 | 60 | 90 | 0
  maxPlayers: number        // 2–8
}
