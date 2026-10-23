import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  updateJobStatus,
  cancelJob,
} from '../services/jobsApi'

export function useUpdateJobStatus(jobId) {
  const queryClient = useQueryClient()

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['job', jobId],
      }),

      queryClient.invalidateQueries({
        queryKey: ['job', jobId, 'quotes'],
      }),

      queryClient.invalidateQueries({
        queryKey: ['myJobs'],
      }),

      queryClient.invalidateQueries({
        queryKey: ['assignedJobs'],
      }),
    ])
  }

  const updateMutation = useMutation({
    mutationFn: (status) =>
      updateJobStatus(jobId, status),

    onSuccess: async () => {
      console.log(
        '✅ Job status mutation succeeded'
      )

      await invalidate()
    },

    onError: (error) => {
      console.error(
        '❌ Could not update job status:',
        error
      )
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelJob(jobId),

    onSuccess: async () => {
      await invalidate()
    },

    onError: (error) => {
      console.error(
        '❌ Could not cancel job:',
        error
      )
    },
  })

  return {
    setStatus: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    cancel: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    cancelError: cancelMutation.error,
  }
}