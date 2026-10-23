import { formatDistanceToNow } from 'date-fns'
import { MapPin } from 'lucide-react'
import { JobStatusBadge } from '@/features/jobs/components/JobStatusBadge'

export function JobCard({ job, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-card border border-border bg-surface p-3 text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-ink">{job.title}</p>
        <JobStatusBadge status={job.status} />
      </div>
      {job.category?.name && <p className="mt-0.5 text-sm text-muted">{job.category.name}</p>}
      <div className="mt-2 flex items-center gap-3 text-xs text-ink-soft">
        {job.address && (
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{job.address}</span>
          </span>
        )}
        <span className="shrink-0 text-muted">
          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
        </span>
      </div>
    </button>
  )
}