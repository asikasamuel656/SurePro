import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Share2, MoreVertical, Flag, Ban, UserPlus, UserCheck } from 'lucide-react'
import { ReportModal } from '@/features/safety/components/ReportModal'
import { useBlockToggle } from '@/features/safety/hooks/useBlocking'
import { PageContainer } from '@/components/layout/PageContainer'
import { ReviewCard } from '@/components/cards/ReviewCard'
import { ProfileHeader } from '../components/ProfileHeader'
import { StatsRow } from '../components/StatsRow'
import { ServiceList } from '../components/ServiceList'
import { GalleryGrid } from '../components/GalleryGrid'
import { ProfileActionBar } from '../components/ProfileActionBar'
import { useProfessionalProfile } from '../hooks/useProfessionalProfile'
import { useFollow } from '../hooks/useFollow'
import { useSaveProfessional } from '@/features/saved/hooks/useSaveProfessional'
import { ReputationBreakdown } from '@/features/reputation/components/ReputationBreakdown'
import { BadgeList } from '@/features/reputation/components/BadgeList'
import { ReviewForm } from '@/features/reputation/components/ReviewForm'
import { useBadges } from '@/features/reputation/hooks/useBadges'
import { useSubmitReview } from '@/features/reputation/hooks/useSubmitReview'
import { useStartConversation } from '@/features/messaging/hooks/useStartConversation'
import { ROUTES, chatPath } from '@/constants/routes'

export function ProfessionalProfile() {
  const navigate = useNavigate()
  const { id } = useParams()

  const { profile, services, portfolio, reviews, isLoading, isError } = useProfessionalProfile(id)
  const { isFollowing, toggle: toggleFollow, isToggling: isTogglingFollow } = useFollow(id)
  const { isSaved, toggle: toggleSave } = useSaveProfessional(id)
  const { data: badges = [] } = useBadges(id)
  const { myReview, canReview, submit: submitReview, isSubmitting: isSubmittingReview, error: reviewError } =
    useSubmitReview(id)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const startConversationMutation = useStartConversation()
  const [reportOpen, setReportOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { isBlocked, toggle: toggleBlock, isToggling: isTogglingBlock } = useBlockToggle(id)

  const handleContact = () => {
    startConversationMutation.mutate(
      { otherUserId: id },
      { onSuccess: (conversationId) => navigate(chatPath(conversationId)) }
    )
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: profile?.profile?.full_name ?? 'SurePro professional', url })
      } catch {
        // user cancelled -- no action needed
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-bg">
        <div className="mobile-shell mx-auto max-w-2xl flex min-h-dvh items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="min-h-dvh bg-bg">
        <div className="mobile-shell mx-auto max-w-2xl flex min-h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="font-semibold text-ink">Couldn't load this profile</p>
          <p className="text-sm text-muted">It may have been removed, or check your connection.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell mx-auto flex min-h-dvh max-w-2xl flex-col">
        <div className="flex items-center justify-between px-6 pt-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-soft"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-soft"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-soft"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 z-10 w-48 rounded-card border border-border bg-surface py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      toggleFollow()
                      setMenuOpen(false)
                    }}
                    disabled={isTogglingFollow}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink"
                  >
                    {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReportOpen(true)
                      setMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink"
                  >
                    <Flag className="h-4 w-4" />
                    Report
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toggleBlock()
                      setMenuOpen(false)
                    }}
                    disabled={isTogglingBlock}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-danger"
                  >
                    <Ban className="h-4 w-4" />
                    {isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {reportOpen && <ReportModal targetType="user" targetId={id} onClose={() => setReportOpen(false)} />}

        <ProfileHeader profile={profile} badges={badges} reviewCount={reviews.length} onContact={handleContact} />

        {startConversationMutation.isError && (
          <p className="mx-6 mt-2 rounded-control bg-danger/10 px-3 py-2 text-center text-sm text-danger">
            {startConversationMutation.error?.message ?? "Couldn't start a conversation."}
          </p>
        )}

        <PageContainer className="space-y-6 px-6 pt-5">
          <StatsRow
            yearsExperience={profile.years_experience}
            completedJobs={profile.completed_jobs}
            completionRate={profile.completion_rate}
            repeatCustomers={profile.repeat_customers}
          />

          {profile.bio && (
            <div>
              <h2 className="mb-2 text-sm font-bold text-ink">About</h2>
              <p className="text-sm text-ink-soft">{profile.bio}</p>
            </div>
          )}

          <div>
            <h2 className="mb-2 text-sm font-bold text-ink">Services &amp; Pricing</h2>
            <ServiceList services={services} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-bold text-ink">Featured work</h2>
            <GalleryGrid items={portfolio} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-bold text-ink">Reputation</h2>
            <ReputationBreakdown profile={profile} />
          </div>

          {badges.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-bold text-ink">Badges</h2>
              <BadgeList badges={badges} />
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">
                What customers say {reviews.length > 0 && `(${reviews.length})`}
              </h2>
              {(myReview || canReview) && (
                <button
                  type="button"
                  onClick={() => setShowReviewForm((v) => !v)}
                  className="text-xs font-semibold text-primary"
                >
                  {myReview ? 'Edit your review' : 'Leave a review'}
                </button>
              )}
            </div>

            {showReviewForm && (
              <div className="mb-3 rounded-card border border-border bg-surface p-3">
                <ReviewForm
                  existingReview={myReview}
                  onSubmit={(values) => submitReview(values, { onSuccess: () => setShowReviewForm(false) })}
                  isSubmitting={isSubmittingReview}
                  error={reviewError}
                />
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-muted">No reviews yet.</p>
            ) : (
              <div className="space-y-2">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </PageContainer>

        <ProfileActionBar
          isSaved={isSaved}
          onToggleSave={() => toggleSave()}
          onHire={() => navigate(ROUTES.CREATE_JOB, { state: { categoryId: profile.category?.id } })}
          onShare={handleShare}
        />
      </div>
    </div>
  )
}