import { useQuery } from '@tanstack/react-query'
import { fetchCustomerJobs } from '../services/customerJobsApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useCustomerJobs() {
  const { profile } = useAuth()

  const customerId = profile?.id ?? null

  const query = useQuery({
    queryKey: ['customer-jobs', customerId],
    queryFn: () => fetchCustomerJobs(customerId),
    enabled: Boolean(customerId),
  })

  return {
    ...query,
    jobs: query.data ?? [],
  }
}