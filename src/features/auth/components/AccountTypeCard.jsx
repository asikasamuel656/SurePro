import { Check, User, Wrench } from 'lucide-react'
import { clsx } from '@/utils/clsx'
import { ACCOUNT_TYPES } from '@/constants/accountTypes'

const ICONS = {
  [ACCOUNT_TYPES.CUSTOMER]: User,
  [ACCOUNT_TYPES.PROFESSIONAL]: Wrench,
}

export function AccountTypeCard({ option, selected, onSelect }) {
  const Icon = ICONS[option.value]

  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      className={clsx(
        'flex w-full items-start gap-4 rounded-card border p-4 text-left transition-colors',
        selected ? 'border-primary bg-primary-light' : 'border-border bg-surface hover:border-primary/40'
      )}
    >
      <span
        className={clsx(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
          selected ? 'bg-primary text-white' : 'bg-bg text-ink-soft'
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1">
        <span className="block font-semibold text-ink">{option.title}</span>
        <span className="mt-0.5 block text-sm text-muted">{option.description}</span>
      </span>
      <span
        className={clsx(
          'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
          selected ? 'border-primary bg-primary text-white' : 'border-border'
        )}
      >
        {selected && <Check className="h-3.5 w-3.5" />}
      </span>
    </button>
  )
}