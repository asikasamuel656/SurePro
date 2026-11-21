import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editQuote } from '../services/quotesApi'

export function useEditQuote(jobId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: editQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['jobRequests'] })
    },
  })
}