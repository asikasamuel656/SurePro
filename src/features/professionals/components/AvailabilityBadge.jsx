import { clsx } from '@/utils/clsx'

export function AvailabilityBadge({ isAvailable }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        isAvailable ? 'bg-primary-light text-primary' : 'bg-bg text-muted'
      )}
    >
      <span
        className={clsx('h-1.5 w-1.5 rounded-full', isAvailable ? 'bg-primary' : 'bg-muted')}
      />
      {isAvailable ? 'Available now' : 'Currently unavailable'}
    </span>
  )
}