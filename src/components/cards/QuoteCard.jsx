import { Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { clsx } from '@/utils/clsx'

export function QuoteCard({
  quote,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
  showAcceptAction = false,
  showRejectAction = false,
  isProfessionalView = false,
}) {
  const professional = quote?.professional

  const name =
    professional?.profile?.full_name || 'SurePro professional'

  const avatarUrl = professional?.profile?.avatar_url

  const amount = Number(quote?.amount ?? 0)

  const rating =
    typeof professional?.rating === 'number'
      ? professional.rating.toFixed(1)
      : 'New'

  const completedJobs = professional?.completed_jobs ?? 0

  const isPending = quote?.status === 'pending'
  const isAccepted = quote?.status === 'accepted'
  const isRejected = quote?.status === 'rejected'
  const isWithdrawn = quote?.status === 'withdrawn'

  /*
   * "rejected" is the database status.
   * We display it as "Cancelled" to the professional/customer.
   */
  const statusLabel = {
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Cancelled',
    withdrawn: 'Withdrawn',
  }

  const displayStatus =
    statusLabel[quote?.status] ||
    quote?.status ||
    'Pending'

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      {/* -------------------------------------------------
          PROFESSIONAL INFORMATION
      ------------------------------------------------- */}
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-bg">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">
            {name}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              {rating}
            </span>

            <span>
              {completedJobs}{' '}
              {completedJobs === 1 ? 'job' : 'jobs'} completed
            </span>
          </div>
        </div>

        {/* -------------------------------------------------
            PRICE + STATUS
        ------------------------------------------------- */}
        <div className="text-right">
          <p className="text-lg font-bold text-primary">
            ₦{amount.toLocaleString('en-NG')}
          </p>

          <span
            className={clsx(
              'mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',

              isAccepted &&
                'bg-primary-light text-primary',

              isRejected &&
                'bg-danger/10 text-danger',

              isPending &&
                'bg-warning/10 text-warning',

              isWithdrawn &&
                'bg-bg text-muted'
            )}
          >
            {displayStatus}
          </span>
        </div>
      </div>

      {/* -------------------------------------------------
          QUOTE MESSAGE
      ------------------------------------------------- */}
      <div className="mt-4 rounded-xl bg-bg p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
          {isProfessionalView
            ? 'Your message'
            : "Professional's message"}
        </p>

        <p className="text-sm leading-5 text-ink-soft">
          {quote?.message ||
            'No message was provided with this quote.'}
        </p>
      </div>

      {/* -------------------------------------------------
          PROPOSED SCHEDULE
      ------------------------------------------------- */}
      {(quote?.proposed_date || quote?.proposed_time) && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-muted">
            Proposed schedule
          </p>

          <p className="mt-1 text-sm text-ink">
            {quote.proposed_date ||
              'Date not specified'}

            {quote.proposed_time
              ? ` • ${quote.proposed_time}`
              : ''}
          </p>
        </div>
      )}

      {/* -------------------------------------------------
          CUSTOMER ACTIONS
          Only the customer can accept/reject.
      ------------------------------------------------- */}
      {!isProfessionalView &&
        (showAcceptAction || showRejectAction) &&
        isPending && (
          <div className="mt-4 flex gap-2">
            {showRejectAction && (
              <Button
                type="button"
                variant="outline"
                onClick={onReject}
                isLoading={isRejecting}
                disabled={
                  isAccepting || isRejecting
                }
                className="flex-1 text-danger"
              >
                Reject
              </Button>
            )}

            {showAcceptAction && (
              <Button
                type="button"
                onClick={onAccept}
                isLoading={isAccepting}
                disabled={
                  isRejecting || isAccepting
                }
                className="flex-1"
              >
                Accept quote
              </Button>
            )}
          </div>
        )}

      {/* -------------------------------------------------
          PROVIDER: PENDING
      ------------------------------------------------- */}
      {isProfessionalView && isPending && (
        <div className="mt-4 rounded-lg bg-warning/10 px-3 py-2">
          <p className="text-xs font-medium text-warning">
            Waiting for the customer to respond to your quote.
          </p>
        </div>
      )}

      {/* -------------------------------------------------
          PROVIDER: ACCEPTED
      ------------------------------------------------- */}
      {isProfessionalView && isAccepted && (
        <div className="mt-4 rounded-lg bg-primary-light px-3 py-2">
          <p className="text-xs font-medium text-primary">
            Your quote was accepted. The job is now assigned to you.
          </p>
        </div>
      )}

      {/* -------------------------------------------------
          PROVIDER: CANCELLED
      ------------------------------------------------- */}
      {isProfessionalView && isRejected && (
        <div className="mt-4 rounded-lg bg-danger/10 px-3 py-2">
          <p className="text-xs font-medium text-danger">
            This quote was cancelled because another
            professional was selected for the job.
          </p>
        </div>
      )}

      {/* -------------------------------------------------
          PROVIDER: WITHDRAWN
      ------------------------------------------------- */}
      {isProfessionalView && isWithdrawn && (
        <div className="mt-4 rounded-lg bg-bg px-3 py-2">
          <p className="text-xs font-medium text-muted">
            You withdrew this quote.
          </p>
        </div>
      )}
    </div>
  )
}