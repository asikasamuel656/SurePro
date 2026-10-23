import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchComments, addComment } from '../services/feedApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useComments(postId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const commentsQuery = useQuery({
    queryKey: ['post', postId, 'comments'],
    queryFn: () => fetchComments(postId),
    enabled: !!postId,
  })

  const addCommentMutation = useMutation({
    mutationFn: (content) => addComment(postId, user.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId, 'comments'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    addComment: addCommentMutation.mutate,
    isAdding: addCommentMutation.isPending,
  }
}