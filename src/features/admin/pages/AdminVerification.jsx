import { useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { useVerificationQueue } from '../hooks/useAdmin'
import { VerificationBadge } from '@/features/professionals/components/VerificationBadge'
import { clsx } from '@/utils/clsx'

const FILTERS = [
  { value: 'pending', label: 'Pending' },
  { value: null, label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'unverified', label: 'Unverified' },
]

export function AdminVerification() {
  const [filter, setFilter] = useState('pending')
  const { data: professionals = [], isLoading, setVerification, isUpdating } = useVerificationQueue(filter)

  return (
    <AdminLayout>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">Verification queue</h2>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => setFilter(f.value)}
              className={clsx(
                'rounded-full px-3 py-1.5 text-xs font-semibold',
                filter === f.value ? 'bg-primary-light text-primary' : 'text-muted'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-card bg-surface" />
          ))}
        </div>
      ) : professionals.length === 0 ? (
        <p className="text-sm text-muted">No professionals in this filter.</p>
      ) : (
        <div className="space-y-2">
          {professionals.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-card border border-border bg-surface p-3">
              <div>
                <p className="text-sm font-semibold text-ink">{p.profile?.full_name ?? 'SurePro professional'}</p>
                <p className="text-xs text-muted">{p.headline}</p>
                <div className="mt-1">
                  <VerificationBadge status={p.verification_status} />
                </div>
              </div>
              <div className="flex gap-2">
                {p.verification_status !== 'verified' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setVerification({ professionalId: p.id, status: 'verified' })}
                    className="rounded-control bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Verify
                  </button>
                )}
                {p.verification_status !== 'unverified' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setVerification({ professionalId: p.id, status: 'unverified' })}
                    className="rounded-control border border-border px-3 py-2 text-xs font-semibold text-ink-soft disabled:opacity-50"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}