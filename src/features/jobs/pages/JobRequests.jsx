import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { JobCard } from '@/components/cards/JobCard'
import { useJobRequests } from '../hooks/useJobRequests'
import { jobDetailsPath } from '@/constants/routes'

export function JobRequests() {
  const navigate = useNavigate()
  const { data: jobs = [], isLoading, isError } = useJobRequests()

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell mx-auto max-w-2xl flex min-h-dvh flex-col">
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-ink">Job requests</h1>
            <p className="text-xs text-muted">Matching your registered profession</p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {isLoading && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-card bg-bg" />
              ))}
            </div>
          )}

          {isError && (
            <p className="rounded-card bg-danger/10 p-4 text-sm text-danger">
              Couldn't load job requests right now.
            </p>
          )}

          {!isLoading && !isError && jobs.length === 0 && (
            <div className="rounded-card border border-dashed border-border p-6 text-center">
              <p className="text-sm font-medium text-ink">No matching requests right now</p>
              <p className="mt-1 text-sm text-muted">
                Requests for your registered profession will show up here as customers post them.
              </p>
            </div>
          )}

          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onClick={() => navigate(jobDetailsPath(job.id))} />
          ))}
        </div>
      </div>
    </div>
  )
}