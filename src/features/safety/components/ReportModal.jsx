import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { fileReport } from '../services/safetyApi'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { clsx } from '@/utils/clsx'

const REASONS = [
  'Inappropriate content',
  'Scam or fraud',
  'Harassment or abuse',
  'Fake profile',
  'Something else',
]

export function ReportModal({ targetType, targetId, onClose }) {
  const { user } = useAuth()
  const [reason, setReason] = useState(null)
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!reason) return
    setIsSubmitting(true)
    try {
      await fileReport({ reporterId: user.id, targetType, targetId, reason, details: details || null })
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40">
      <div className="mobile-shell w-full rounded-t-card bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Report</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-4 text-center">
            <p className="font-medium text-ink">Thanks for letting us know</p>
            <p className="mt-1 text-sm text-muted">Our team will review this report.</p>
            <Button onClick={onClose} className="mt-4">
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={clsx(
                    'w-full rounded-control border px-4 py-3 text-left text-sm font-medium',
                    reason === r ? 'border-primary bg-primary-light text-primary' : 'border-border text-ink-soft'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Additional details (optional)"
              rows={3}
              className="mt-3 w-full rounded-control border border-border bg-surface px-4 py-3 text-[15px] placeholder:text-muted focus:border-primary"
            />
            <Button onClick={handleSubmit} disabled={!reason} isLoading={isSubmitting} className="mt-4">
              Submit report
            </Button>
          </>
        )}
      </div>
    </div>
  )
}