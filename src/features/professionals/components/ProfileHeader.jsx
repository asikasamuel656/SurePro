import { Phone, MessageCircle, BadgeCheck, Star, MapPin, Wrench } from 'lucide-react'
import { AvailabilityBadge } from './AvailabilityBadge'

export function ProfileHeader({ profile, badges = [], reviewCount = 0, onContact }) {
  const name = profile.profile?.full_name ?? 'SurePro professional'
  const avatarUrl = profile.profile?.avatar_url
  const phone = profile.profile?.phone
  const isTopPro = profile.verification_status === 'verified' && badges.some((b) => b.name === 'Top Rated')

  return (
    <div className="px-6 pt-2">
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-bg">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted">
              {name[0]}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h1 className="truncate text-lg font-bold text-ink">{name}</h1>
            {profile.verification_status === 'verified' && (
              <BadgeCheck className="h-4 w-4 shrink-0 fill-primary text-white" />
            )}
          </div>

          {isTopPro && (
            <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
              <Star className="h-3 w-3 fill-warning" />
              Top Pro
            </span>
          )}

          <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft">
            <Wrench className="h-3.5 w-3.5 shrink-0" />
            {profile.category?.name ?? 'General services'}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <MapPin className="h-3 w-3 shrink-0" />
            Service area available on request
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-center rounded-card border border-border bg-surface px-3 py-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="text-base font-bold text-ink">
              {profile.rating?.toFixed ? profile.rating.toFixed(1) : 'New'}
            </span>
          </div>
          <span className="text-[10px] text-muted">
            {reviewCount > 0 ? `${reviewCount} review${reviewCount === 1 ? '' : 's'}` : 'No reviews yet'}
          </span>
        </div>
      </div>

      {profile.headline && <p className="mt-3 text-sm text-ink-soft">{profile.headline}</p>}

      <div className="mt-4 flex items-center justify-between rounded-card border border-border bg-surface px-3 py-2.5">
        <AvailabilityBadge isAvailable={profile.is_available} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onContact}
            aria-label="Message"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          {phone && (
            <a
              href={`tel:${phone}`}
              aria-label="Call"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white"
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}