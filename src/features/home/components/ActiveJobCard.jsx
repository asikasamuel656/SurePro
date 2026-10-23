import { useNavigate } from 'react-router-dom'
import { Radio } from 'lucide-react'
import { JobStatusBadge } from '@/features/jobs/components/JobStatusBadge'
import { jobDetailsPath, jobTrackingPath } from '@/constants/routes'

const TRACKABLE = ['on_the_way', 'arrived', 'in_progress']

export function ActiveJobCard({ job }) {
  const navigate = useNavigate()
  if (!job) return null

  const proName = job.professional?.profile?.full_name ?? 'A SurePro professional'
  const isTrackable = TRACKABLE.includes(job.status)

  return (
    <div className="mx-6 rounded-card border border-primary/30 bg-primary-light p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-primary">Your active job</span>
        <JobStatusBadge status={job.status} />
      </div>
      <p className="mt-2 font-semibold text-ink">{job.title}</p>
      <p className="text-sm text-muted">{proName}</p>

      <div className="mt-3 flex gap-2">
        {isTrackable && (
          <button
            type="button"
            onClick={() => navigate(jobTrackingPath(job.id))}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-control bg-primary py-2.5 text-sm font-semibold text-white"
          >
            <Radio className="h-4 w-4" />
            Track Job
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate(jobDetailsPath(job.id))}
          className="flex-1 rounded-control border border-primary/40 bg-surface py-2.5 text-sm font-semibold text-primary"
        >
          View Job
        </button>
      </div>
    </div>
  )
}