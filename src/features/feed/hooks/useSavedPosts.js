import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSavedPostIds, toggleSave } from '../services/feedApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useSavedPosts() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const savedQuery = useQuery({
    queryKey: ['savedPosts', user?.id],
    queryFn: () => fetchSavedPostIds(user.id),
    enabled: !!user?.id,
  })

  const toggleMutation = useMutation({
    mutationFn: ({ postId, isSaved }) => toggleSave(postId, user.id, isSaved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedPosts', user?.id] })
    },
  })

  const savedIds = new Set(savedQuery.data ?? [])

  return {
    savedIds,
    isSaved: (postId) => savedIds.has(postId),
    toggle: (postId) => toggleMutation.mutate({ postId, isSaved: savedIds.has(postId) }),
  }
}