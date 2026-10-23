import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchIsFollowing, follow, unfollow } from '../services/followApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useFollow(professionalId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const isFollowingQuery = useQuery({
    queryKey: ['professional', professionalId, 'isFollowing', user?.id],
    queryFn: () => fetchIsFollowing(user.id, professionalId),
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
    mutationFn: () => follow(user.id, professionalId),
    onSuccess: invalidate,
  })

  const unfollowMutation = useMutation({
    mutationFn: () => unfollow(user.id, professionalId),
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