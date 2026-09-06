import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  session: null,
  user: null,
  profile: null,
  isInitializing: true,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),

  setProfile: (profile) => set({ profile }),

  setInitializing: (isInitializing) => set({ isInitializing }),

  clear: () => set({ session: null, user: null, profile: null }),
}))