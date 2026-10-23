import { useQuery } from '@tanstack/react-query'
import { fetchProviderDirectRequests } from '../services/providerJobsApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useProviderDirectRequests() {
  const { profile } = useAuth()

  const professionalId = profile?.id ?? null

  const query = useQuery({
    queryKey: ['provider-direct-requests', professionalId],
    queryFn: () => fetchProviderDirectRequests(professionalId),
    enabled: Boolean(professionalId),
  })

  return {
    ...query,
    jobs: query.data ?? [],
  }
}