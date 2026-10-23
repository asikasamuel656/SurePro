import { useQuery } from '@tanstack/react-query'
import { fetchSavedProfessionals, fetchSavedPosts, fetchFollowing } from '../services/savedApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useSavedProfessionals() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['savedProfessionals', user?.id],
    queryFn: () => fetchSavedProfessionals(user.id),
    enabled: !!user?.id,
  })
}

export function useSavedPostsList() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['savedPostsList', user?.id],
    queryFn: () => fetchSavedPosts(user.id),
    enabled: !!user?.id,
  })
}

export function useFollowingList() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['followingList', user?.id],
    queryFn: () => fetchFollowing(user.id),
    enabled: !!user?.id,
  })
}