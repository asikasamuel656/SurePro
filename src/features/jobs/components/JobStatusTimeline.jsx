import { Check } from 'lucide-react'
import { clsx } from '@/utils/clsx'

const LIFECYCLE = [
  'open',
  'quoted',
  'accepted',
  'preparing',
  'on_the_way',
  'arrived',
  'in_progress',
  'completed',
]

const LABELS = {
  open: 'Job posted',
  quoted: 'Quotes received',
  accepted: 'Professional accepted',
  preparing: 'Preparing',
  on_the_way: 'On the way',
  arrived: 'Arrived',
  in_progress: 'Job started',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function JobStatusTimeline({ currentStatus }) {
  const isCancelled = currentStatus === 'cancelled'

  const steps = isCancelled
    ? ['open', 'cancelled']
    : LIFECYCLE

  const currentIndex = LIFECYCLE.indexOf(currentStatus)

  return (
    <div className="space-y-0">
      {steps.map((status, index) => {
        const statusIndex = LIFECYCLE.indexOf(status)

        const reached =
          status === 'cancelled'
            ? true
            : statusIndex <= currentIndex

        const isCurrent = status === currentStatus
        const isLast = index === steps.length - 1

        return (
          <div key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={clsx(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
                  reached
                    ? status === 'cancelled'
                      ? 'border-danger bg-danger text-white'
                      : 'border-primary bg-primary text-white'
                    : 'border-border bg-surface text-transparent'
                )}
              >
                <Check className="h-3.5 w-3.5" />
              </span>

              {!isLast && (
                <span
                  className={clsx(
                    'w-0.5 flex-1 transition-colors duration-300',
                    reached ? 'bg-primary' : 'bg-border'
                  )}
                  style={{ minHeight: '2rem' }}
                />
              )}
            </div>

            <div
              className={clsx(
                'pb-6',
                isLast && 'pb-0'
              )}
            >
              <p
                className={clsx(
                  'text-sm font-semibold',
                  reached ? 'text-ink' : 'text-muted',
                  isCurrent && 'text-primary'
                )}
              >
                {LABELS[status]}
              </p>

              {isCurrent && status !== 'completed' && status !== 'cancelled' && (
                <p className="mt-0.5 text-xs text-primary">
                  Current stage
                </p>
              )}

              {status === 'completed' && currentStatus === 'completed' && (
                <p className="mt-0.5 text-xs text-primary">
                  Job completed
                </p>
              )}

              {status === 'cancelled' && (
                <p className="mt-0.5 text-xs text-danger">
                  Job cancelled
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}