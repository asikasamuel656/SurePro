import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { getProfile } from '../services/authApi'

/**
 * Subscribes once to Supabase's auth state and mirrors it into the Zustand
 * store. Call this once near the root of the app (see AuthProvider).
 */
export function useAuthListener() {
  const setSession = useAuthStore((s) => s.setSession)
  const setInitializing = useAuthStore((s) => s.setInitializing)
  const queryClient = useQueryClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setInitializing(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    })

    return () => subscription.subscription.unsubscribe()
  }, [setSession, setInitializing, queryClient])
}

/**
 * Fetches the current user's profile row. Depends on the auth store already
 * having a user set by useAuthListener.
 */
export function useProfile() {
  const user = useAuthStore((s) => s.user)
  const setProfile = useAuthStore((s) => s.setProfile)

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user.id),
    enabled: !!user?.id,
    retry: false,
  })

  useEffect(() => {
    if (query.data) setProfile(query.data)
  }, [query.data, setProfile])

  return query
}

export function useAuth() {
  const session = useAuthStore((s) => s.session)
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const isInitializing = useAuthStore((s) => s.isInitializing)

  return {
    session,
    user,
    profile,
    isAuthenticated: !!session,
    isEmailVerified: !!user?.email_confirmed_at,
    isInitializing,
  }
}