import { useMutation, useQueryClient } from '@tanstack/react-query'
import { withdrawQuote } from '../services/quotesApi'

export function useWithdrawQuote(jobId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: withdrawQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['jobRequests'] })
    },
  })
}