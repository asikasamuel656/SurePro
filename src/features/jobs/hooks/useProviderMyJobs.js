import { useQuery } from '@tanstack/react-query'
import { fetchProviderMyJobs } from '../services/providerJobsApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useProviderMyJobs() {
  const { profile } = useAuth()

  const professionalId = profile?.id ?? null

  const query = useQuery({
    queryKey: ['provider-my-jobs', professionalId],
    queryFn: () => fetchProviderMyJobs(professionalId),
    enabled: Boolean(professionalId),
  })

  return {
    ...query,
    jobs: query.data ?? [],
  }
}