import { clsx } from '@/utils/clsx'

const LABELS = {
  open: 'Open',
  quoted: 'Quotes received',
  accepted: 'Accepted',
  preparing: 'Preparing',
  on_the_way: 'On the way',
  arrived: 'Arrived',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STYLES = {
  open: 'bg-bg text-ink-soft',
  quoted: 'bg-primary-light text-primary',
  accepted: 'bg-primary-light text-primary',
  preparing: 'bg-warning/10 text-warning',
  on_the_way: 'bg-warning/10 text-warning',
  arrived: 'bg-warning/10 text-warning',
  in_progress: 'bg-warning/10 text-warning',
  completed: 'bg-primary text-white',
  cancelled: 'bg-danger/10 text-danger',
}

export function JobStatusBadge({ status }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        STYLES[status] ?? STYLES.open
      )}
    >
      {LABELS[status] ?? status}
    </span>
  )
}