import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  Room,
  RoomPlayer,
  Category,
  Round,
  Answer,
  PlayerScore,
  GameState,
} from '@/types/game.types'

interface GameStore extends GameState {
  // --- Setters ---
  setRoom: (room: Room | null) => void
  setPlayers: (players: RoomPlayer[]) => void
  upsertPlayer: (player: RoomPlayer) => void
  removePlayer: (playerId: string) => void
  setCategories: (categories: Category[]) => void
  setCurrentRound: (round: Round | null) => void
  setAnswers: (answers: Answer[]) => void
  upsertAnswer: (answer: Answer) => void
  setScores: (scores: PlayerScore[]) => void
  setPhase: (phase: GameState['phase']) => void

  // --- Actions ---
  reset: () => void
}

const initialState: GameState = {
  room: null,
  players: [],
  categories: [],
  currentRound: null,
  answers: [],
  scores: [],
  phase: 'lobby',
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setRoom: (room) => set({ room }),

      setPlayers: (players) => set({ players }),

      upsertPlayer: (player) =>
        set((state) => {
          const exists = state.players.find((p) => p.player_id === player.player_id)
          return {
            players: exists
              ? state.players.map((p) => (p.player_id === player.player_id ? player : p))
              : [...state.players, player],
          }
        }),

      removePlayer: (playerId) =>
        set((state) => ({
          players: state.players.filter((p) => p.player_id !== playerId),
        })),

      setCategories: (categories) => set({ categories }),

      setCurrentRound: (round) => set({ currentRound: round }),

      setAnswers: (answers) => set({ answers }),

      upsertAnswer: (answer) =>
        set((state) => {
          const exists = state.answers.find(
            (a) => a.player_id === answer.player_id && a.category_id === answer.category_id
          )
          return {
            answers: exists
              ? state.answers.map((a) =>
                  a.player_id === answer.player_id && a.category_id === answer.category_id
                    ? answer
                    : a
                )
              : [...state.answers, answer],
          }
        }),

      setScores: (scores) => set({ scores }),

      setPhase: (phase) => set({ phase }),

      reset: () => set(initialState),
    }),
    { name: 'petit-bac-game' }
  )
)
