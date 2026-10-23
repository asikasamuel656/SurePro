import { useQuery } from '@tanstack/react-query'
import { fetchProviderJob } from '../services/providerJobsApi'

export function useProviderJobDetails(jobId) {
  const query = useQuery({
    queryKey: ['provider-job-details', jobId],
    queryFn: () => fetchProviderJob(jobId),
    enabled: Boolean(jobId),
  })

  return {
    ...query,
    job: query.data ?? null,
  }
}