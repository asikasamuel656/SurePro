import { useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { useAdminReports } from '../hooks/useAdmin'
import { clsx } from '@/utils/clsx'

const FILTERS = [
  { value: 'open', label: 'Open' },
  { value: null, label: 'All' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

export function AdminReports() {
  const [filter, setFilter] = useState('open')
  const { data: reports = [], isLoading, setStatus, isUpdating } = useAdminReports(filter)

  return (
    <AdminLayout>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">Reports</h2>
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
            <div key={i} className="h-20 animate-pulse rounded-card bg-surface" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <p className="text-sm text-muted">No reports in this filter.</p>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <div key={report.id} className="rounded-card border border-border bg-surface p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {report.reason} <span className="font-normal text-muted">on a {report.target_type}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    Reported by {report.reporter?.full_name ?? 'Unknown'} ·{' '}
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-semibold text-muted">
                  {report.status}
                </span>
              </div>
              {report.details && <p className="mt-2 text-sm text-ink-soft">{report.details}</p>}

              {report.status === 'open' && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setStatus({ reportId: report.id, status: 'resolved' })}
                    className="rounded-control bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Mark resolved
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setStatus({ reportId: report.id, status: 'dismissed' })}
                    className="rounded-control border border-border px-3 py-2 text-xs font-semibold text-ink-soft disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}