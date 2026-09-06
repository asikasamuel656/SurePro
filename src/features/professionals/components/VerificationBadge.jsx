import { BadgeCheck, Clock } from 'lucide-react'
import { clsx } from '@/utils/clsx'

export function VerificationBadge({ status }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
        <BadgeCheck className="h-3.5 w-3.5" />
        Verified
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
        <Clock className="h-3.5 w-3.5" />
        Verification pending
      </span>
    )
  }
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full bg-bg px-2.5 py-1 text-xs font-semibold text-muted'
      )}
    >
      Unverified
    </span>
  )
}