import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  ChevronLeft,
  Radio,
  Navigation,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Send,
  MessageCircle,
  Phone,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'

import {
  TrackingMap,
} from '../components/TrackingMap'

import {
  HorizontalStepper,
} from '../components/HorizontalStepper'

import {
  JobSummaryCard,
} from '../components/JobSummaryCard'

import {
  SafetyBanner,
} from '../components/SafetyBanner'

import {
  useJob,
} from '@/features/jobs/hooks/useJob'

import {
  useLiveLocation,
} from '../hooks/useLiveLocation'

import {
  useLocationBroadcast,
} from '../hooks/useLocationBroadcast'

import {
  useRoute,
} from '../hooks/useRoute'

import {
  useAuth,
} from '@/features/auth/hooks/useAuth'

import {
  useStartConversation,
} from '@/features/messaging/hooks/useStartConversation'

import {
  chatPath,
} from '@/constants/routes'

const TRACKABLE_STATUSES = [
  'on_the_way',
  'arrived',
  'in_progress',
]

const STATUS_COPY = {
  on_the_way: {
    icon: Navigation,
    title: 'Pro is on the way',
  },

  arrived: {
    icon: MapPin,
    title: 'Pro has arrived',
  },

  in_progress: {
    icon: CheckCircle2,
    title: 'Job in progress',
  },
}

export function JobTracking() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()

  const {
    job,
    events,
    isLoading,
  } = useJob(id)

  const startConversationMutation =
    useStartConversation()

  const isProfessional =
    job?.accepted_professional_id ===
    user?.id

  const isCustomer =
    job?.customer_id === user?.id

  const isTrackable =
    job &&
    TRACKABLE_STATUSES.includes(
      job.status
    )

  const liveLocation =
    useLiveLocation(
      isTrackable ? id : null
    )

  const broadcast =
    useLocationBroadcast({
      jobId: id,
      professionalId: user?.id,
    })

  /*
   * These values are safe to calculate
   * before the loading return because they
   * use optional chaining / null checks.
   */
  const destination =
    job?.latitude != null &&
    job?.longitude != null
      ? {
          latitude: job.latitude,
          longitude: job.longitude,
        }
      : null

  const professionalPosition =
    liveLocation
      ? {
          latitude:
            liveLocation.latitude,
          longitude:
            liveLocation.longitude,
        }
      : null

  /*
   * IMPORTANT:
   * useRoute MUST always be called.
   * It cannot be placed after the loading
   * or missing-job return.
   */
  const {
    route,
    isLoading: isRouteLoading,
    error: routeError,
  } = useRoute({
    from: professionalPosition,
    to: destination,
  })

  if (isLoading || !job) {
    return (
      <div className="min-h-dvh bg-bg">
        <div className="mobile-shell mx-auto flex min-h-dvh max-w-2xl items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      </div>
    )
  }

  const proName =
    job.professional?.profile
      ?.full_name ??
    'Your professional'

  const proPhone =
    job.professional?.profile?.phone

  const statusInfo =
    STATUS_COPY[job.status]

  const handleMessage = () => {
    const otherUserId = isCustomer
      ? job.accepted_professional_id
      : job.customer_id

    if (!otherUserId) {
      return
    }

    startConversationMutation.mutate(
      {
        otherUserId,
        jobId: id,
      },
      {
        onSuccess: (
          conversationId
        ) => {
          navigate(
            chatPath(conversationId)
          )
        },
      }
    )
  }

  const handleShareTracking =
    async () => {
      const url =
        window.location.href

      if (navigator.share) {
        try {
          await navigator.share({
            title: `Tracking: ${job.title}`,
            url,
          })
        } catch {
          // User cancelled sharing.
        }
      } else if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          url
        )
      }
    }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell mx-auto flex min-h-dvh max-w-2xl flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h1 className="flex-1 text-base font-bold text-ink">
            Track Job
          </h1>
        </div>

        {/* Tracking not active */}
        {!isTrackable ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-medium text-ink">
              Tracking isn't active yet
            </p>

            <p className="text-sm text-muted">
              Once the professional is
              on the way, live tracking
              will appear here.
            </p>
          </div>
        ) : !destination ? (
          /* No destination */
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-medium text-ink">
              No destination set for
              this job
            </p>

            <p className="text-sm text-muted">
              This job was posted
              without a pinned location,
              so the map can't be shown.
            </p>
          </div>
        ) : (
          <>
            {/* Status header */}
            {statusInfo && (
              <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                  <statusInfo.icon className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">
                    {statusInfo.title}
                  </p>

                  <p className="truncate text-xs text-muted">
                    {proName}
                  </p>
                </div>

                {professionalPosition &&
                  destination && (
                    <RouteETAPill
                      route={route}
                      isLoading={
                        isRouteLoading
                      }
                    />
                  )}
              </div>
            )}

            {/* Map */}
            <div className="relative">
              <TrackingMap
                professionalPosition={
                  professionalPosition
                }
                destination={
                  destination
                }
                route={route}
                isRouteLoading={
                  isRouteLoading
                }
                routeError={
                  routeError
                }
              />

              {/* Map controls */}
              <div className="absolute bottom-3 right-3 z-[1000] flex flex-col gap-2">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary shadow"
                  aria-label="Safe tracking"
                >
                  <ShieldCheck className="h-4 w-4" />
                </span>

                <button
                  type="button"
                  onClick={
                    handleShareTracking
                  }
                  aria-label="Share tracking"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink-soft shadow"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tracking information */}
            <div className="space-y-3 border-t border-border bg-surface px-4 py-4">

              {!professionalPosition && (
                <p className="text-center text-sm text-muted">
                  {isProfessional
                    ? 'Start sharing your location so the customer can see your progress.'
                    : 'Waiting for your professional to start sharing their location...'}
                </p>
              )}

              {professionalPosition && (
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />

                  Live location active
                </div>
              )}

              {/* Professional location sharing */}
              {isProfessional && (
                <Button
                  variant={
                    broadcast.isSharing
                      ? 'outline'
                      : 'primary'
                  }
                  icon={Radio}
                  onClick={() =>
                    broadcast.isSharing
                      ? broadcast.stop()
                      : broadcast.start()
                  }
                >
                  {broadcast.isSharing
                    ? 'Stop sharing location'
                    : 'Start sharing my location'}
                </Button>
              )}

              {broadcast.error && (
                <p className="text-center text-sm text-danger">
                  {broadcast.error}
                </p>
              )}

              {/* Job status */}
              <HorizontalStepper
                events={events}
                currentStatus={
                  job.status
                }
              />

              {/* Job information */}
              <JobSummaryCard
                job={job}
              />

              {/* Contact */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  icon={MessageCircle}
                  onClick={
                    handleMessage
                  }
                  className="text-sm"
                >
                  Message{' '}
                  {isCustomer
                    ? 'Pro'
                    : 'Customer'}
                </Button>

                {proPhone ? (
                  <a
                    href={`tel:${proPhone}`}
                    className="flex items-center justify-center gap-2 rounded-control border border-border py-3.5 text-sm font-semibold text-ink"
                  >
                    <Phone className="h-4 w-4" />

                    Call{' '}
                    {isCustomer
                      ? 'Pro'
                      : 'Customer'}
                  </a>
                ) : (
                  <Button
                    variant="outline"
                    icon={Phone}
                    disabled
                    className="text-sm"
                  >
                    No number yet
                  </Button>
                )}
              </div>

              <SafetyBanner />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function RouteETAPill({
  route,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="shrink-0 rounded-card bg-primary-light px-3 py-1.5 text-center">
        <p className="text-sm font-bold text-primary">
          …
        </p>

        <p className="text-[9px] text-primary/70">
          ROUTE
        </p>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="shrink-0 rounded-card bg-surface-soft px-3 py-1.5 text-center">
        <p className="text-sm font-bold text-muted">
          —
        </p>

        <p className="text-[9px] text-muted">
          ETA
        </p>
      </div>
    )
  }

  const etaMinutes = Math.max(
    1,
    Math.round(
      route.durationSeconds / 60
    )
  )

  return (
    <div className="shrink-0 rounded-card bg-primary-light px-3 py-1.5 text-center">
      <p className="text-sm font-bold text-primary">
        {etaMinutes} min
      </p>

      <p className="text-[9px] text-primary/70">
        ETA
      </p>
    </div>
  )
}