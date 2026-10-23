import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchBlockedIds, isBlocked, blockUser, unblockUser } from '../services/safetyApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useBlockedIds() {
  const { user } = useAuth()
  const query = useQuery({
    queryKey: ['blockedIds', user?.id],
    queryFn: () => fetchBlockedIds(user.id),
    enabled: !!user?.id,
  })
  return query.data ?? []
}

export function useBlockToggle(targetUserId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['isBlocked', targetUserId, user?.id],
    queryFn: () => isBlocked(user.id, targetUserId),
    enabled: !!targetUserId && !!user?.id,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['isBlocked', targetUserId, user?.id] })
    queryClient.invalidateQueries({ queryKey: ['blockedIds', user?.id] })
    queryClient.invalidateQueries({ queryKey: ['blockedUsers', user?.id] })
  }

  const blockMutation = useMutation({ mutationFn: () => blockUser(user.id, targetUserId), onSuccess: invalidate })
  const unblockMutation = useMutation({ mutationFn: () => unblockUser(user.id, targetUserId), onSuccess: invalidate })

  return {
    isBlocked: !!query.data,
    toggle: () => (query.data ? unblockMutation.mutate() : blockMutation.mutate()),
    isToggling: blockMutation.isPending || unblockMutation.isPending,
  }
}