import { useQuery } from '@tanstack/react-query'
import { fetchCustomerJob } from '../services/customerJobsApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useCustomerJobDetails(jobId) {
  const { profile } = useAuth()

  const customerId = profile?.id ?? null

  const query = useQuery({
    queryKey: ['customer-job-details', customerId, jobId],
    queryFn: () => fetchCustomerJob(jobId, customerId),
    enabled: Boolean(customerId && jobId),
  })

  return {
    ...query,
    job: query.data ?? null,
  }
}