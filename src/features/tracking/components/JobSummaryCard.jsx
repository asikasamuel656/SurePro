import { Wrench } from 'lucide-react'
import { format, isToday } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { jobDetailsPath } from '@/constants/routes'

export function JobSummaryCard({ job }) {
  const navigate = useNavigate()
  const createdAt = new Date(job.created_at)
  const dateLabel = isToday(createdAt) ? format(createdAt, "'Today,' h:mm a") : format(createdAt, 'MMM d, h:mm a')

  return (
    <div className="rounded-card border border-border bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-ink">Job Summary</span>
        <button
          type="button"
          onClick={() => navigate(jobDetailsPath(job.id))}
          className="text-xs font-semibold text-primary"
        >
          View details
        </button>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
            <Wrench className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{job.title}</p>
            {job.description && <p className="text-xs text-muted">{job.description}</p>}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-medium text-ink">{dateLabel}</p>
          <p className="text-[10px] text-muted">Job ID: #{job.id.slice(0, 6).toUpperCase()}</p>
        </div>
      </div>
    </div>
  )
}