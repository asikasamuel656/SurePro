import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchIsFollowing, follow, unfollow } from '../services/professionalApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useFollow(professionalId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const isFollowingQuery = useQuery({
    queryKey: ['professional', professionalId, 'isFollowing', user?.id],
    queryFn: () => fetchIsFollowing(professionalId, user.id),
    enabled: !!professionalId && !!user?.id,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ['professional', professionalId, 'isFollowing'],
    })
    queryClient.invalidateQueries({
      queryKey: ['professional', professionalId, 'followerCount'],
    })
  }

  const followMutation = useMutation({
    mutationFn: () => follow(professionalId, user.id),
    onSuccess: invalidate,
  })

  const unfollowMutation = useMutation({
    mutationFn: () => unfollow(professionalId, user.id),
    onSuccess: invalidate,
  })

  return {
    isFollowing: !!isFollowingQuery.data,
    isLoading: isFollowingQuery.isLoading,
    toggle: () =>
      isFollowingQuery.data ? unfollowMutation.mutate() : followMutation.mutate(),
    isToggling: followMutation.isPending || unfollowMutation.isPending,
  }
}