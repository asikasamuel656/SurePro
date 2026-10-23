import { useNavigate } from 'react-router-dom'
import {
  Plus,
  SlidersHorizontal,
  BriefcaseBusiness,
} from 'lucide-react'

import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { JobCard } from '../components/JobCard'
import { useMyJobs } from '../hooks/useMyJobs'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ACCOUNT_TYPES } from '@/constants/accountTypes'
import { jobDetailsPath, ROUTES } from '@/constants/routes'

export function MyJobs() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const isProfessional =
    profile?.account_type === ACCOUNT_TYPES.PROFESSIONAL

  const {
    data: jobs = [],
    isLoading,
    isError,
  } = useMyJobs()

  return (
    <CustomerLayout>
      <div className="flex min-h-0 flex-1 flex-col">

        {/* Header */}
        <header className="shrink-0 border-b border-border bg-surface px-5 pb-4 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted">
                {isProfessional ? 'Your work' : 'Your activity'}
              </p>

              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-ink">
                {isProfessional ? 'My work' : 'My jobs'}
              </h1>
            </div>

            {isProfessional ? (
              <button
                type="button"
                onClick={() => navigate(ROUTES.JOB_REQUESTS)}
                className="rounded-xl bg-primary-light px-3 py-2 text-xs font-semibold text-primary"
              >
                Browse requests
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(ROUTES.CREATE_JOB)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm"
                aria-label="Post a job"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">
                {jobs.length}{' '}
                {jobs.length === 1 ? 'job' : 'jobs'}
              </p>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-soft"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
            </button>
          </div>
        </header>

        {/* SCROLLABLE JOB AREA */}
        <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-28 pt-4">

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-bg"
                />
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 p-5 text-center">
              <p className="text-sm font-semibold text-danger">
                Couldn't load your jobs
              </p>

              <p className="mt-1 text-xs text-danger/80">
                Please check your connection and try again.
              </p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && jobs.length === 0 && (
            <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light">
                <BriefcaseBusiness className="h-7 w-7 text-primary" />
              </div>

              <h2 className="mt-4 text-base font-semibold text-ink">
                {isProfessional
                  ? 'No jobs yet'
                  : "You haven't posted a job yet"}
              </h2>

              <p className="mt-2 max-w-xs text-sm leading-5 text-muted">
                {isProfessional
                  ? 'Accepted job requests will appear here.'
                  : 'Post a job and start receiving quotes from verified professionals.'}
              </p>

              {!isProfessional && (
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.CREATE_JOB)}
                  className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Post a job
                </button>
              )}
            </div>
          )}

          {/* Jobs */}
          {!isLoading && !isError && jobs.length > 0 && (
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() =>
                    navigate(jobDetailsPath(job.id))
                  }
                />
              ))}
            </div>
          )}
        </main>

        {/* Fixed navigation */}
        <BottomNavigation />
      </div>
    </CustomerLayout>
  )
}