import { useQuery } from '@tanstack/react-query'
import { canUseFeature } from '../services/entitlementsApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

/**
 * Example: const { allowed } = useFeatureAccess('job_requests')
 * if (!allowed) show an upgrade prompt instead of the action.
 * Nothing in SurePro calls this yet -- it's the seam, not a gate.
 */
export function useFeatureAccess(featureKey) {
  const { user } = useAuth()
  const query = useQuery({
    queryKey: ['canUseFeature', featureKey, user?.id],
    queryFn: () => canUseFeature(user.id, featureKey),
    enabled: !!user?.id && !!featureKey,
    staleTime: 60_000,
  })
  return { allowed: query.data ?? true, isLoading: query.isLoading }
}