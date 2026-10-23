import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  MapPin,
} from 'lucide-react'

function formatDate(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getStatusStyles(status) {
  switch (status) {
    case 'open':
      return 'bg-primary-light text-primary'

    case 'quoted':
      return 'bg-warning/10 text-warning'

    case 'accepted':
      return 'bg-primary-light text-primary'

    case 'completed':
      return 'bg-blue-50 text-blue-600'

    case 'cancelled':
      return 'bg-danger/10 text-danger'

    default:
      return 'bg-bg text-muted'
  }
}

function formatStatus(status) {
  if (!status) return 'Unknown'

  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function JobCard({ job, onClick }) {
  const categoryName = job.category?.name ?? 'Service'
  const categoryIcon = job.category?.icon

  const budget =
    job.budget_min != null || job.budget_max != null
      ? `₦${Number(job.budget_min ?? 0).toLocaleString()}${
          job.budget_max != null
            ? ` – ₦${Number(job.budget_max).toLocaleString()}`
            : '+'
        }`
      : 'Budget not specified'

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-border bg-surface p-4 text-left shadow-sm transition active:scale-[0.99]"
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-lg">
            {categoryIcon || <BriefcaseBusiness className="h-5 w-5 text-primary" />}
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted">
              {categoryName}
            </p>

            <h3 className="mt-0.5 truncate text-sm font-semibold text-ink">
              {job.title}
            </h3>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusStyles(
            job.status
          )}`}
        >
          {formatStatus(job.status)}
        </span>
      </div>

      {/* Description */}
      {job.description && (
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-ink-soft">
          {job.description}
        </p>
      )}

      {/* Location */}
      {job.address && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{job.address}</span>
        </div>
      )}

      {/* Bottom */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="min-w-0">
          <p className="text-[10px] text-muted">Budget</p>
          <p className="mt-0.5 text-sm font-semibold text-ink">
            {budget}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1 text-[10px] text-muted sm:flex">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(job.created_at)}
          </div>

          <ChevronRight className="h-4 w-4 text-muted" />
        </div>
      </div>
    </button>
  )
}