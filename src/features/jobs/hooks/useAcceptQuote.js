import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acceptQuote } from '../services/jobsApi'

export function useAcceptQuote(jobId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: acceptQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['myJobs'] })
    },
  })
}