import { X } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { clsx } from '@/utils/clsx'

const SORT_OPTIONS = [
  { value: 'distance', label: 'Closest to me' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'jobs', label: 'Most jobs completed' },
]

export function FilterSheet({ open, onClose, sortBy, onSortChange }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40">
      <div className="mobile-shell w-full rounded-t-card bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Sort &amp; filter</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-bg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-2 text-sm font-medium text-ink-soft">Sort by</p>
        <div className="space-y-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSortChange(option.value)}
              className={clsx(
                'w-full rounded-control border px-4 py-3 text-left text-sm font-medium',
                sortBy === option.value
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-border text-ink-soft'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <Button onClick={onClose}>Apply</Button>
        </div>
      </div>
    </div>
  )
}