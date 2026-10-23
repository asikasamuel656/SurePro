import { useQuery } from '@tanstack/react-query'
import { fetchProviderOpenJobs } from '../services/providerJobsApi'
import { useLocationStore } from '@/store/locationStore'

export function useProviderOpenJobs({
  categoryId = null,
  searchTerm = '',
} = {}) {
  const location = useLocationStore((state) => state.location)

  const coords =
    location?.latitude != null &&
    location?.longitude != null
      ? {
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
        }
      : null

  const query = useQuery({
    queryKey: [
      'provider-open-jobs',
      coords?.latitude ?? null,
      coords?.longitude ?? null,
      categoryId,
      searchTerm,
    ],

    queryFn: () =>
      fetchProviderOpenJobs({
        coords,
        categoryId,
        searchTerm,
      }),
  })

  return {
    ...query,
    jobs: query.data ?? [],
  }
}