import { useQuery } from '@tanstack/react-query'
import { fetchJob, fetchQuotesForJob, fetchJobStatusEvents, fetchJobPhotos } from '../services/jobsApi'

export function useJob(jobId) {
  const jobQuery = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => fetchJob(jobId),
    enabled: !!jobId,
  })

  const quotesQuery = useQuery({
    queryKey: ['job', jobId, 'quotes'],
    queryFn: () => fetchQuotesForJob(jobId),
    enabled: !!jobId,
  })

  const eventsQuery = useQuery({
    queryKey: ['job', jobId, 'events'],
    queryFn: () => fetchJobStatusEvents(jobId),
    enabled: !!jobId,
  })

  const photosQuery = useQuery({
    queryKey: ['job', jobId, 'photos'],
    queryFn: () => fetchJobPhotos(jobId),
    enabled: !!jobId,
  })

  return {
    job: jobQuery.data,
    quotes: quotesQuery.data ?? [],
    events: eventsQuery.data ?? [],
    photos: photosQuery.data ?? [],
    isLoading: jobQuery.isLoading,
    isError: jobQuery.isError,
  }
}