import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Profile } from '@/types/game.types'

interface UserStore {
  profile: Profile | null
  setProfile: (profile: Profile | null) => void
  updateProfile: (partial: Partial<Profile>) => void
  clear: () => void
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        profile: null,

        setProfile: (profile) => set({ profile }),

        updateProfile: (partial) =>
          set((state) => ({
            profile: state.profile ? { ...state.profile, ...partial } : null,
          })),

        clear: () => set({ profile: null }),
      }),
      {
        name: 'petit-bac-user',
        // Ne persiste que username et avatar (pas les données sensibles)
        partialize: (state) =>
          state.profile
            ? { profile: { id: state.profile.id, username: state.profile.username, avatar_url: state.profile.avatar_url } }
            : {},
      }
    ),
    { name: 'petit-bac-user' }
  )
)
