import { Check } from 'lucide-react'
import { format } from 'date-fns'
import { clsx } from '@/utils/clsx'

const STEPS = [
  { status: 'accepted', label: 'Request accepted' },
  { status: 'on_the_way', label: 'Pro heading to you' },
  { status: 'arrived', label: 'Arrived' },
  { status: 'in_progress', label: 'Job in progress' },
  { status: 'completed', label: 'Completed' },
]

// Full lifecycle order, used to map statuses like 'preparing' (which has no
// dedicated column here) onto the nearest completed visible step.
const FULL_ORDER = ['open', 'quoted', 'accepted', 'preparing', 'on_the_way', 'arrived', 'in_progress', 'completed']

function effectiveStepIndex(currentStatus) {
  const fullIndex = FULL_ORDER.indexOf(currentStatus)
  if (fullIndex === -1) return -1
  // Walk backwards from the current position to the nearest status that has
  // a visible column.
  for (let i = fullIndex; i >= 0; i--) {
    const stepIndex = STEPS.findIndex((s) => s.status === FULL_ORDER[i])
    if (stepIndex !== -1) return stepIndex
  }
  return -1
}

export function HorizontalStepper({ events, currentStatus }) {
  const eventByStatus = new Map(events.map((e) => [e.status, e]))
  const currentIndex = effectiveStepIndex(currentStatus)

  return (
    <div className="flex items-start justify-between">
      {STEPS.map((step, i) => {
        const event = eventByStatus.get(step.status)
        const isDone = i <= currentIndex
        const isCurrent = i === currentIndex

        return (
          <div key={step.status} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <span className={clsx('h-0.5 flex-1', isDone ? 'bg-primary' : 'bg-border')} />
              )}
              <span
                className={clsx(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  isDone
                    ? isCurrent
                      ? 'bg-warning text-white'
                      : 'bg-primary text-white'
                    : 'border-2 border-border bg-surface text-transparent'
                )}
              >
                <Check className="h-3.5 w-3.5" />
              </span>
              {i < STEPS.length - 1 && (
                <span className={clsx('h-0.5 flex-1', i < currentIndex ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
            <p className={clsx('mt-1.5 text-[10px] font-medium leading-tight', isDone ? 'text-ink' : 'text-muted')}>
              {step.label}
            </p>
            {event && <p className="text-[9px] text-muted">{format(new Date(event.created_at), 'h:mm a')}</p>}
          </div>
        )
      })}
    </div>
  )
}