import { useQuery } from '@tanstack/react-query'
import { fetchBadges } from '../services/reputationApi'

export function useBadges(professionalId) {
  return useQuery({
    queryKey: ['professional', professionalId, 'badges'],
    queryFn: () => fetchBadges(professionalId),
    enabled: !!professionalId,
  })
}