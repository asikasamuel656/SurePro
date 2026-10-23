import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleReaction } from '../services/feedApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useLike() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, hasReacted }) => toggleReaction(postId, user.id, hasReacted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['post'] })
    },
  })
}