
import { useQuery } from '@tanstack/react-query'
import {
  fetchMyJobs,
  fetchAssignedJobs,
} from '../services/jobsApi'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ACCOUNT_TYPES } from '@/constants/accountTypes'

export function useMyJobs() {
  const { user, profile } = useAuth()

  const isProfessional =
    profile?.account_type === ACCOUNT_TYPES.PROFESSIONAL

  return useQuery({
    queryKey: ['myJobs', user?.id, isProfessional],

    queryFn: async () => {
      if (!isProfessional) {
        return {
          postedJobs: await fetchMyJobs(user.id),
          assignedJobs: [],
        }
      }

      const [postedJobs, assignedJobs] =
        await Promise.all([
          fetchMyJobs(user.id),
          fetchAssignedJobs(user.id),
        ])

      return {
        postedJobs,
        assignedJobs,
      }
    },

    enabled: !!user?.id,
  })
}
