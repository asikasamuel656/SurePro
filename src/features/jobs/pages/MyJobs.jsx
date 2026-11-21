import { useState } from 'react'
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

  const [activeTab, setActiveTab] = useState('work')

  const isProfessional =
    profile?.account_type === ACCOUNT_TYPES.PROFESSIONAL

  const {
    data,
    isLoading,
    isError,
  } = useMyJobs()

  const postedJobs = data?.postedJobs ?? []
  const assignedJobs = data?.assignedJobs ?? []

  const jobs = isProfessional
    ? activeTab === 'work'
      ? assignedJobs
      : postedJobs
    : postedJobs

  const emptyTitle = isProfessional
    ? activeTab === 'work'
      ? 'No assigned jobs yet'
      : "You haven't posted a job yet"
    : "You haven't posted a job yet"

  const emptyDescription = isProfessional
    ? activeTab === 'work'
      ? 'Jobs you accept from customers will appear here, including completed work.'
      : 'Post a job to find another professional when you need a service.'
    : 'Post a job and start receiving quotes from verified professionals.'

  return (
    <CustomerLayout>
      <div className="flex min-h-0 flex-1 flex-col">

        <header className="shrink-0 border-b border-border bg-surface px-5 pb-4 pt-5">

          {/* Page heading and actions */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted">
                Your activity
              </p>

              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-ink">
                My jobs
              </h1>
            </div>

            <div className="flex items-center gap-2">

              {isProfessional && (
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.JOB_REQUESTS)}
                  className="rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-bg"
                >
                  Browse requests
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate(ROUTES.CREATE_JOB)}
                className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Post a job
              </button>

            </div>
          </div>

          {/* Professional tabs */}
          {isProfessional && (
            <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-bg p-1">

              <button
                type="button"
                onClick={() => setActiveTab('work')}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === 'work'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                My Work
                <span className="ml-1.5 text-xs">
                  ({assignedJobs.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('posted')}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === 'posted'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Jobs I've Posted
                <span className="ml-1.5 text-xs">
                  ({postedJobs.length})
                </span>
              </button>

            </div>
          )}

          {/* Job count and filter */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted">
              {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
            </p>

            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-soft"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
            </button>
          </div>

        </header>

        {/* Jobs content */}
        <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-28 pt-4">

          {/* Loading state */}
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

          {/* Error state */}
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

          {/* Empty state */}
          {!isLoading && !isError && jobs.length === 0 && (
            <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light">
                <BriefcaseBusiness className="h-7 w-7 text-primary" />
              </div>

              <h2 className="mt-4 text-base font-semibold text-ink">
                {emptyTitle}
              </h2>

              <p className="mt-2 max-w-xs text-sm leading-5 text-muted">
                {emptyDescription}
              </p>

              {(!isProfessional || activeTab === 'posted') && (
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.CREATE_JOB)}
                  className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Post a job
                </button>
              )}

              {isProfessional && activeTab === 'work' && (
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.JOB_REQUESTS)}
                  className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Browse requests
                </button>
              )}

            </div>
          )}

          {/* Jobs list */}
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

        <BottomNavigation />

      </div>
    </CustomerLayout>
  )
}