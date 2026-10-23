import { useNavigate } from 'react-router-dom'
import {
  Star,
  CheckCircle2,
  Repeat,
  Zap,
  Wrench,
  ChevronRight,
  Circle,
} from 'lucide-react'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { TopBar } from '@/components/layout/TopBar'
import { PageContainer } from '@/components/layout/PageContainer'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { JobCard } from '@/components/cards/JobCard'
import { HomeSection } from '../components/HomeSection'
import { WorkPreviewCard } from '../components/WorkPreviewCard'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { NotificationItem } from '@/features/notifications/components/NotificationItem'
import { useProfessionalHomeData } from '../hooks/useProfessionalHomeData'
import { ROUTES, jobDetailsPath } from '@/constants/routes'

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'

  return 'Good evening'
}

export function ProfessionalHome() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { notifications } = useNotifications()

  const {
    professional,
    isProfessionalLoading,
    opportunities,
    isOpportunitiesLoading,
    activeJobs,
    upcomingJobs,
    isJobsLoading,
    recentWork,
    isRecentWorkLoading,
  } = useProfessionalHomeData()

  const firstName = profile?.full_name?.split(' ')[0]
  const recentActivity = notifications.slice(0, 4)

  if (isProfessionalLoading) {
    return (
      <CustomerLayout>
        <TopBar />

        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>

        <BottomNavigation />
      </CustomerLayout>
    )
  }

  if (!professional) {
    return (
      <CustomerLayout>
        <TopBar />

        <PageContainer className="flex flex-col items-center justify-center px-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
            <Wrench className="h-8 w-8" />
          </span>

          <h1 className="mt-4 text-lg font-bold text-ink">
            Set up your professional profile
          </h1>

          <p className="mt-1 max-w-sm text-sm leading-5 text-muted">
            Add your profession and headline to start receiving matching job
            opportunities.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(ROUTES.EDIT_PROFESSIONAL_PROFILE)
            }
            className="mt-4 rounded-control bg-primary px-5 py-3 text-sm font-semibold text-white"
          >
            Set up now
          </button>
        </PageContainer>

        <BottomNavigation />
      </CustomerLayout>
    )
  }

  const rating =
    professional.rating?.toFixed
      ? professional.rating.toFixed(1)
      : 'New'

  const responseRate =
    professional.response_rate != null
      ? `${Math.round(professional.response_rate)}%`
      : '—'

  const repeatCustomers = professional.repeat_customers ?? 0

  return (
    <CustomerLayout>
      <TopBar />

      <PageContainer className="min-w-0 overflow-x-hidden space-y-4 pb-4">
        {/* Header */}
        <div className="flex items-start justify-between px-6">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">
              Professional dashboard
            </p>

            <h1 className="mt-0.5 truncate text-xl font-bold text-ink">
              {getGreeting()}
              {firstName ? `, ${firstName}` : ''}
            </h1>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(ROUTES.EDIT_PROFESSIONAL_PROFILE)
            }
            className="mt-1 flex shrink-0 items-center gap-1 text-xs font-semibold text-primary"
          >
            Edit profile
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Professional status */}
        <div className="mx-6 flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                professional.is_available
                  ? 'bg-primary-light text-primary'
                  : 'bg-bg text-muted'
              }`}
            >
              <Circle
                className={`h-3 w-3 fill-current ${
                  professional.is_available
                    ? 'text-primary'
                    : 'text-muted'
                }`}
              />
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                {professional.is_available
                  ? 'Available for jobs'
                  : 'Currently unavailable'}
              </p>

              <p className="truncate text-xs text-muted">
                Manage your availability from Edit Profile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(ROUTES.EDIT_PROFESSIONAL_PROFILE)
            }
            className="shrink-0 text-xs font-semibold text-primary"
          >
            Manage
          </button>
        </div>

        {/* Performance */}
        <div className="px-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">
              Performance
            </h2>

            <span className="text-[11px] text-muted">
              Your profile activity
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              {
                icon: Star,
                value: rating,
                label: 'Rating',
              },
              {
                icon: CheckCircle2,
                value: professional.completed_jobs ?? 0,
                label: 'Jobs done',
              },
              {
                icon: Zap,
                value: responseRate,
                label: 'Response',
              },
              {
                icon: Repeat,
                value: repeatCustomers,
                label: 'Repeat',
              },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex min-w-0 flex-col items-center rounded-card border border-border bg-surface px-1 py-3 text-center"
              >
                <Icon className="h-4 w-4 text-primary" />

                <span className="mt-1 text-sm font-bold text-ink">
                  {value}
                </span>

                <span className="truncate text-[10px] leading-tight text-muted">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* New opportunities */}
        <HomeSection
          title="New Job Opportunities"
          onSeeAll={() => navigate(ROUTES.JOB_REQUESTS)}
          isEmpty={
            !isOpportunitiesLoading &&
            opportunities.length === 0
          }
          emptyMessage="No matching requests right now — new ones in your profession will show up here."
        >
          {isOpportunitiesLoading
            ? [0, 1].map((i) => (
                <div
                  key={i}
                  className="h-24 w-64 shrink-0 animate-pulse rounded-card bg-bg"
                />
              ))
            : opportunities.map((job) => (
                <div
                  key={job.id}
                  className="w-64 shrink-0"
                >
                  <JobCard
                    job={job}
                    onClick={() =>
                      navigate(jobDetailsPath(job.id))
                    }
                  />
                </div>
              ))}
        </HomeSection>

        {/* Active jobs */}
        {!isJobsLoading && activeJobs.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between px-6">
              <h2 className="text-base font-bold text-ink">
                Active Jobs
              </h2>

              <button
                type="button"
                onClick={() => navigate(ROUTES.MY_JOBS)}
                className="flex items-center gap-0.5 text-xs font-semibold text-primary"
              >
                See all
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2 px-6">
              {activeJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() =>
                    navigate(jobDetailsPath(job.id))
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming jobs */}
        {!isJobsLoading && upcomingJobs.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between px-6">
              <h2 className="text-base font-bold text-ink">
                Upcoming Jobs
              </h2>

              <button
                type="button"
                onClick={() => navigate(ROUTES.MY_JOBS)}
                className="text-xs font-semibold text-primary"
              >
                View all
              </button>
            </div>

            <div className="space-y-2 px-6">
              {upcomingJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() =>
                    navigate(jobDetailsPath(job.id))
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Professional posts */}
        <HomeSection
          title="Your Posts"
          onSeeAll={() => navigate(ROUTES.FEED)}
          isEmpty={
            !isRecentWorkLoading &&
            recentWork.length === 0
          }
          emptyMessage="You haven't posted anything yet. Share updates, projects, or helpful content from the Feed."
        >
          {isRecentWorkLoading
            ? [0, 1].map((i) => (
                <div
                  key={i}
                  className="h-48 w-48 shrink-0 animate-pulse rounded-card bg-bg"
                />
              ))
            : recentWork.map((post) => (
                <WorkPreviewCard
                  key={post.id}
                  post={post}
                  className="w-48 sm:w-full"
                />
              ))}
        </HomeSection>

        {/* Activity */}
        {recentActivity.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between px-6">
              <h2 className="text-base font-bold text-ink">
                Recent Activity
              </h2>

              <button
                type="button"
                onClick={() =>
                  navigate(ROUTES.NOTIFICATIONS)
                }
                className="text-xs font-semibold text-primary"
              >
                See all
              </button>
            </div>

            <div className="border-t border-border">
              {recentActivity.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() =>
                    navigate(ROUTES.NOTIFICATIONS)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </PageContainer>

      <BottomNavigation />
    </CustomerLayout>
  )
}