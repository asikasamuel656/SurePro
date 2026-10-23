import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Radio } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { ImageUploader } from '@/components/forms/ImageUploader'
import { JobStatusBadge } from '../components/JobStatusBadge'
import { JobStatusTimeline } from '../components/JobStatusTimeline'
import { QuoteCard } from '@/components/cards/QuoteCard'
import { QuoteForm } from '../components/QuoteForm'

import { useJob } from '../hooks/useJob'
import { useAcceptQuote } from '../hooks/useAcceptQuote'
import { useSubmitQuote } from '../hooks/useSubmitQuote'
import { useUpdateJobStatus } from '../hooks/useUpdateJobStatus'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { ACCOUNT_TYPES } from '@/constants/accountTypes'

import {
  addJobPhoto,
  rejectQuote,
} from '../services/jobsApi'

import { useQueryClient } from '@tanstack/react-query'
import { useStartConversation } from '@/features/messaging/hooks/useStartConversation'

import {
  chatPath,
  jobTrackingPath,
} from '@/constants/routes'

const NEXT_STATUS = {
  accepted: 'preparing',
  preparing: 'on_the_way',
  on_the_way: 'arrived',
  arrived: 'in_progress',
  in_progress: 'completed',
}

const NEXT_LABEL = {
  preparing: 'Mark as Preparing',
  on_the_way: 'Mark as On the Way',
  arrived: 'Mark as Arrived',
  in_progress: 'Start the Job',
  completed: 'Mark Completed',
}

export function JobDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const { user, profile } = useAuth()

  const isProfessional =
    profile?.account_type === ACCOUNT_TYPES.PROFESSIONAL

  const queryClient = useQueryClient()

  const [rejectingQuoteId, setRejectingQuoteId] =
    useState(null)

  const {
    job,
    quotes,
    events,
    photos,
    isLoading,
    isError,
  } = useJob(id)

  const acceptQuoteMutation = useAcceptQuote(id)

  const submitQuoteMutation = useSubmitQuote(id)

  const {
    setStatus,
    isUpdating,
    cancel,
    isCancelling,
  } = useUpdateJobStatus(id)

  const startConversationMutation =
    useStartConversation()

  /*
   * IMPORTANT:
   * professionals.id is not necessarily the same as
   * the authenticated user's profile id.
   *
   * We therefore compare through:
   * professional.profile.id
   */
  const myQuote = quotes.find(
    (quote) =>
      quote.professional?.profile?.id === user?.id
  )

  /*
   * The accepted_professional_id belongs to the
   * professionals table, while user.id belongs to
   * profiles/auth.
   *
   * JOB_SELECT gives us the nested professional profile,
   * so use that to determine whether this provider owns
   * the accepted job.
   */
  const isOwner =
    job?.accepted_professional?.profile?.id === user?.id

  const isCustomer =
    job?.customer_id === user?.id

  const handleAddPhoto = async (url) => {
    await addJobPhoto({
      jobId: id,
      uploadedBy: user.id,
      photoUrl: url,
      stage: 'progress',
    })

    queryClient.invalidateQueries({
      queryKey: ['job', id, 'photos'],
    })
  }

  if (isLoading || !job) {
    return (
      <div className="min-h-dvh bg-bg">
        <div className="mobile-shell mx-auto flex min-h-dvh max-w-2xl items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-dvh bg-bg">
        <div className="mobile-shell mx-auto flex min-h-dvh max-w-2xl items-center justify-center px-6 text-center text-sm text-muted">
          Couldn't load this job.
        </div>
      </div>
    )
  }

  /*
   * Reject a customer's selected quote.
   */
  const handleRejectQuote = async (quoteId) => {
    try {
      setRejectingQuoteId(quoteId)

      await rejectQuote({
        jobId: id,
        quoteId,
      })

      await queryClient.invalidateQueries({
        queryKey: ['job', id, 'quotes'],
      })

      await queryClient.invalidateQueries({
        queryKey: ['job', id],
      })
    } finally {
      setRejectingQuoteId(null)
    }
  }

  const nextStatus = NEXT_STATUS[job.status]

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell mx-auto flex min-h-dvh max-w-2xl flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h1 className="truncate text-base font-bold text-ink">
            {job.title}
          </h1>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">

          {/* Job information */}
          <div>
            <div className="flex items-center justify-between">
              <JobStatusBadge status={job.status} />

              {job.category?.name && (
                <span className="text-xs text-muted">
                  {job.category.name}
                </span>
              )}
            </div>

            {job.description && (
              <p className="mt-2 text-sm text-ink-soft">
                {job.description}
              </p>
            )}

            {job.address && (
              <p className="mt-1 text-xs text-muted">
                📍 {job.address}
              </p>
            )}

            {(job.budget_min || job.budget_max) && (
              <p className="mt-1 text-xs text-muted">
                Budget: ₦
                {Number(
                  job.budget_min ?? 0
                ).toLocaleString()}
                {' - '}
                ₦
                {Number(
                  job.budget_max ??
                    job.budget_min ??
                    0
                ).toLocaleString()}
              </p>
            )}
          </div>

          {/* Track job */}
          {[
            'on_the_way',
            'arrived',
            'in_progress',
          ].includes(job.status) && (
            <Button
              variant="secondary"
              icon={Radio}
              onClick={() =>
                navigate(jobTrackingPath(id))
              }
            >
              Track this job
            </Button>
          )}

          {/* Message other party */}
          {job.accepted_professional_id &&
            (isCustomer || isOwner) && (
              <Button
                variant="outline"
                onClick={() =>
                  startConversationMutation.mutate(
                    {
                      otherUserId: isCustomer
                        ? job.accepted_professional
                            ?.profile?.id
                        : job.customer_id,
                      jobId: id,
                    },
                    {
                      onSuccess: (conversationId) =>
                        navigate(
                          chatPath(conversationId)
                        ),
                    }
                  )
                }
              >
                Message{' '}
                {isCustomer
                  ? 'the professional'
                  : 'the customer'}
              </Button>
            )}

          {/* Professional lifecycle controls */}
          {isOwner &&
            nextStatus &&
            job.status !== 'completed' && (
              <div className="rounded-card border border-primary/20 bg-primary-light p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  Next job stage
                </p>

                <Button
                  onClick={() =>
                    setStatus(nextStatus)
                  }
                  isLoading={isUpdating}
                  className="w-full"
                >
                  {NEXT_LABEL[nextStatus]}
                </Button>
              </div>
            )}

          {/* Customer cancel */}
          {isCustomer &&
            !['completed', 'cancelled'].includes(
              job.status
            ) && (
              <button
                type="button"
                onClick={() => cancel()}
                disabled={isCancelling}
                className="text-sm font-medium text-danger"
              >
                {isCancelling
                  ? 'Cancelling...'
                  : 'Cancel this job'}
              </button>
            )}

          {/* Job roadmap */}
          <div>
            <h2 className="mb-3 text-sm font-bold text-ink">
              Job passport
            </h2>

            <JobStatusTimeline
              currentStatus={job.status}
            />
          </div>

          {/* Professional quote */}
          {isProfessional && (
            <div>
              {myQuote ? (
                <>
                  <h2 className="mb-2 text-sm font-bold text-ink">
                    Your quote
                  </h2>

                  <QuoteCard
                    quote={myQuote}
                    showAcceptAction={false}
                    showRejectAction={false}
                    isProfessionalView
                  />
                </>
              ) : (
                !isOwner &&
                ['open', 'quoted'].includes(job.status) && (
                  <>
                    <h2 className="mb-2 text-sm font-bold text-ink">
                      Submit a quote
                    </h2>

                    <QuoteForm
                      onSubmit={(values) =>
                        submitQuoteMutation.mutate({
                          jobId: id,
                          professionalId: user.id,
                          ...values,
                        })
                      }
                      isSubmitting={
                        submitQuoteMutation.isPending
                      }
                      error={submitQuoteMutation.error}
                    />
                  </>
                )
              )}
            </div>
          )}

          {/* Customer quotes */}
          {isCustomer && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink">
                  Quotes ({quotes.length})
                </h2>

                {job.status === 'quoted' && (
                  <span className="text-xs font-medium text-warning">
                    Review and choose a quote
                  </span>
                )}
              </div>

              {quotes.length === 0 ? (
                <div className="rounded-card border border-border bg-surface p-4 text-sm text-muted">
                  No quotes have been submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {quotes.map((quote) => {
                    const isPending =
                      quote.status === 'pending'

                    const canRespond =
                      ['open', 'quoted'].includes(
                        job.status
                      ) && isPending

                    return (
                      <QuoteCard
                        key={quote.id}
                        quote={quote}

                        showAcceptAction={
                          canRespond
                        }

                        showRejectAction={
                          canRespond
                        }

                        isAccepting={
                          acceptQuoteMutation.isPending
                        }

                        isRejecting={
                          rejectingQuoteId === quote.id
                        }

                        onAccept={() =>
                          acceptQuoteMutation.mutate({
                            jobId: id,
                            quoteId: quote.id,
                            professionalId:
                              quote.professional?.id,
                          })
                        }

                        onReject={() =>
                          handleRejectQuote(
                            quote.id
                          )
                        }
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Job photos */}
          {job.accepted_professional_id && (
            <div>
              <h2 className="mb-2 text-sm font-bold text-ink">
                Job photos
              </h2>

              {(isOwner || isCustomer) && (
                <div className="grid grid-cols-3 gap-1.5">
                  {photos.length > 0 &&
                    photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="aspect-square overflow-hidden rounded-lg bg-bg"
                      >
                        <img
                          src={photo.photo_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}

                  <ImageUploader
                    bucket="job-photos"
                    folder={id}
                    onUploaded={handleAddPhoto}
                  />
                </div>
              )}

              {!isOwner &&
                !isCustomer &&
                photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="aspect-square overflow-hidden rounded-lg bg-bg"
                      >
                        <img
                          src={photo.photo_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}