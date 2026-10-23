import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitQuote } from '../services/jobsApi'

export function useSubmitQuote(jobId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['jobRequests'] })
    },
  })
}