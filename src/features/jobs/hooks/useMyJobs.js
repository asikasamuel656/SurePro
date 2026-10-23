import { useQuery } from '@tanstack/react-query'
import { fetchMyJobs, fetchAssignedJobs } from '../services/jobsApi'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ACCOUNT_TYPES } from '@/constants/accountTypes'

export function useMyJobs() {
  const { user, profile } = useAuth()
  const isProfessional = profile?.account_type === ACCOUNT_TYPES.PROFESSIONAL

  return useQuery({
    queryKey: ['myJobs', user?.id, isProfessional],
    queryFn: () =>
      isProfessional ? fetchAssignedJobs(user.id) : fetchMyJobs(user.id),
    enabled: !!user?.id,
  })
}