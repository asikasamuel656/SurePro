import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchFollowRelationship, follow, unfollow, fetchFollowerCount } from '../services/followApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useFollow(otherUserId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const relationshipQuery = useQuery({
    queryKey: ['followRelationship', otherUserId, user?.id],
    queryFn: () => fetchFollowRelationship(user.id, otherUserId),
    enabled: !!otherUserId && !!user?.id,
  })

  const followerCountQuery = useQuery({
    queryKey: ['followerCount', otherUserId],
    queryFn: () => fetchFollowerCount(otherUserId),
    enabled: !!otherUserId,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['followRelationship', otherUserId] })
    queryClient.invalidateQueries({ queryKey: ['followerCount', otherUserId] })
    queryClient.invalidateQueries({ queryKey: ['followingList'] })
  }

  const followMutation = useMutation({
    mutationFn: () => follow(user.id, otherUserId),
    onSuccess: invalidate,
  })

  const unfollowMutation = useMutation({
    mutationFn: () => unfollow(user.id, otherUserId),
    onSuccess: invalidate,
  })

  const { iFollow, followsMe } = relationshipQuery.data ?? {}

  return {
    isFollowing: !!iFollow,
    followsMe: !!followsMe,
    isMutual: !!iFollow && !!followsMe,
    followerCount: followerCountQuery.data ?? 0,
    toggle: () => (iFollow ? unfollowMutation.mutate() : followMutation.mutate()),
    isToggling: followMutation.isPending || unfollowMutation.isPending,
  }
}