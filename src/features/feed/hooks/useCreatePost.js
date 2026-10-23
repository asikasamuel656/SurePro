import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPost } from '../services/feedApi'

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}