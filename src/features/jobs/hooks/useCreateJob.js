import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createJob } from '../services/jobsApi'

export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createJob,

    onSuccess: () => {
      // Refresh jobs-related queries after creating a job
      queryClient.invalidateQueries({
        queryKey: ['jobs'],
      })

      queryClient.invalidateQueries({
        queryKey: ['my-jobs'],
      })

      queryClient.invalidateQueries({
        queryKey: ['home-active-job'],
      })
    },
  })
}