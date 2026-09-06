import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { ReviewCard } from '@/components/cards/ReviewCard'
import { ProfileHeader } from '../components/ProfileHeader'
import { StatsRow } from '../components/StatsRow'
import { ServiceList } from '../components/ServiceList'
import { GalleryGrid } from '../components/GalleryGrid'
import { useProfessionalProfile } from '../hooks/useProfessionalProfile'
import { useFollow } from '../hooks/useFollow'

export function ProfessionalProfile() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [comingSoon, setComingSoon] = useState(false)

  const { profile, services, portfolio, reviews, followerCount, isLoading, isError } =
    useProfessionalProfile(id)
  const { isFollowing, toggle, isToggling } = useFollow(id)

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-bg">
        <div className="mobile-shell flex min-h-dvh items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="min-h-dvh bg-bg">
        <div className="mobile-shell flex min-h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="font-semibold text-ink">Couldn't load this profile</p>
          <p className="text-sm text-muted">It may have been removed, or check your connection.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell flex min-h-dvh flex-col">
        <div className="flex items-center px-6 pt-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-soft"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <ProfileHeader
          profile={profile}
          isFollowing={isFollowing}
          onToggleFollow={toggle}
          isTogglingFollow={isToggling}
          onContact={() => setComingSoon('message')}
          onHire={() => setComingSoon('hire')}
        />

        {comingSoon && (
          <div className="mx-6 mt-4 rounded-control bg-primary-light px-4 py-2.5 text-center text-sm text-primary">
            {comingSoon === 'hire'
              ? 'Requesting a job arrives in a later phase — stay tuned.'
              : 'Messaging arrives in a later phase — stay tuned.'}
          </div>
        )}

        <PageContainer className="space-y-6 px-6 pt-5">
          <StatsRow
            rating={profile.rating}
            completedJobs={profile.completed_jobs}
            yearsExperience={profile.years_experience}
            followers={followerCount}
          />

          {profile.bio && (
            <div>
              <h2 className="mb-2 text-sm font-bold text-ink">About</h2>
              <p className="text-sm text-ink-soft">{profile.bio}</p>
            </div>
          )}

          <div>
            <h2 className="mb-2 text-sm font-bold text-ink">Services &amp; pricing</h2>
            <ServiceList services={services} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-bold text-ink">Portfolio</h2>
            <GalleryGrid items={portfolio} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-bold text-ink">
              Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h2>
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
      </div>
    </div>
  )
}