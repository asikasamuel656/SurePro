import { useQuery } from '@tanstack/react-query'
import { fetchJobRequests } from '../services/jobsApi'
import { fetchOwnProfessionalRow } from '@/features/profile/services/profileApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

/**
 * Defaults to the logged-in professional's own registered category --
 * matching Part 1 S4 / Part 3 S3: a professional's profession controls the
 * PROVIDER jobs they see, enforced here as the default view (the quotes
 * insert RLS policy is the real backend enforcement; this is just so the
 * UI doesn't show jobs they'd be rejected for anyway).
 */
export function useJobRequests({ categoryId } = {}) {
  const { user } = useAuth()

  const ownProfessionalQuery = useQuery({
    queryKey: ['ownProfessional', user?.id],
    queryFn: () => fetchOwnProfessionalRow(user.id),
    enabled: !!user?.id && categoryId === undefined,
  })

  const effectiveCategoryId =
    categoryId !== undefined ? categoryId : ownProfessionalQuery.data?.category_id ?? undefined

  return useQuery({
    queryKey: ['jobRequests', effectiveCategoryId ?? null],
    queryFn: () => fetchJobRequests({ categoryId: effectiveCategoryId }),
    enabled: categoryId !== undefined || !ownProfessionalQuery.isLoading,
  })
}