import { useQuery } from '@tanstack/react-query'
import { fetchOwnProfessionalRow } from '@/features/profile/services/profileApi'
import { fetchJobRequests, fetchAssignedJobs } from '@/features/jobs/services/jobsApi'
import { fetchFeed } from '@/features/feed/services/feedApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

const ACTIVE_STATUSES = ['on_the_way', 'arrived', 'in_progress']
const UPCOMING_STATUSES = ['accepted', 'preparing']

export function useProfessionalHomeData() {
  const { user } = useAuth()

  const ownProfessionalQuery = useQuery({
    queryKey: ['ownProfessional', user?.id],
    queryFn: () => fetchOwnProfessionalRow(user.id),
    enabled: !!user?.id,
  })

  const categoryId = ownProfessionalQuery.data?.category_id

  const opportunitiesQuery = useQuery({
    queryKey: ['jobRequests', categoryId ?? null],
    queryFn: () => fetchJobRequests({ categoryId }),
    enabled: !!categoryId,
  })

  const myJobsQuery = useQuery({
    queryKey: ['myJobs', user?.id, true],
    queryFn: () => fetchAssignedJobs(user.id),
    enabled: !!user?.id,
  })

  const recentWorkQuery = useQuery({
    queryKey: ['feed', user?.id],
    queryFn: () => fetchFeed({ professionalId: user.id }),
    enabled: !!user?.id,
  })

  const allJobs = myJobsQuery.data ?? []

  return {
    professional: ownProfessionalQuery.data ?? null,
    isProfessionalLoading: ownProfessionalQuery.isLoading,
    opportunities: (opportunitiesQuery.data ?? []).slice(0, 5),
    isOpportunitiesLoading: opportunitiesQuery.isLoading,
    activeJobs: allJobs.filter((j) => ACTIVE_STATUSES.includes(j.status)),
    upcomingJobs: allJobs.filter((j) => UPCOMING_STATUSES.includes(j.status)),
    isJobsLoading: myJobsQuery.isLoading,
    recentWork: (recentWorkQuery.data ?? []).slice(0, 5),
    isRecentWorkLoading: recentWorkQuery.isLoading,
  }
}