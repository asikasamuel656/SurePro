import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { submitReview, fetchMyReview, fetchCanReview } from '../services/reputationApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useSubmitReview(professionalId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const myReviewQuery = useQuery({
    queryKey: ['professional', professionalId, 'myReview', user?.id],
    queryFn: () => fetchMyReview(professionalId, user?.id),
    enabled: !!professionalId && !!user?.id,
  })

  const canReviewQuery = useQuery({
    queryKey: ['professional', professionalId, 'canReview', user?.id],
    queryFn: () => fetchCanReview(professionalId, user?.id),
    enabled: !!professionalId && !!user?.id,
  })

  const mutation = useMutation({
    mutationFn: ({ rating, comment }) =>
      submitReview({ professionalId, customerId: user.id, rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional', professionalId] })
    },
  })

  return {
    myReview: myReviewQuery.data,
    canReview: !!canReviewQuery.data,
    submit: mutation.mutate,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  }
}