import { useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { useAdminJobs } from '../hooks/useAdmin'
import { JobStatusBadge } from '@/features/jobs/components/JobStatusBadge'

const STATUSES = [null, 'open', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled']

export function AdminJobs() {
  const [status, setStatus] = useState(null)
  const { data: jobs = [], isLoading } = useAdminJobs(status)

  return (
    <AdminLayout>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">Jobs</h2>
        <select
          value={status ?? ''}
          onChange={(e) => setStatus(e.target.value || null)}
          className="rounded-control border border-border bg-surface px-2 py-1.5 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s ?? 'all'} value={s ?? ''}>
              {s ?? 'All statuses'}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-card bg-surface" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between rounded-card border border-border bg-surface p-3">
              <div>
                <p className="text-sm font-semibold text-ink">{job.title}</p>
                <p className="text-xs text-muted">by {job.customer?.full_name ?? 'Unknown'}</p>
              </div>
              <JobStatusBadge status={job.status} />
            </div>
          ))}
          {jobs.length === 0 && <p className="text-sm text-muted">No jobs match this filter.</p>}
        </div>
      )}
    </AdminLayout>
  )
}