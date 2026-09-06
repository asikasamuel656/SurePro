import { Phone, MessageCircle, Wrench } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { VerificationBadge } from './VerificationBadge'
import { AvailabilityBadge } from './AvailabilityBadge'

export function ProfileHeader({
  profile,
  isFollowing,
  onToggleFollow,
  isTogglingFollow,
  onContact,
  onHire,
}) {
  const name = profile.profile?.full_name ?? 'SurePro professional'
  const avatarUrl = profile.profile?.avatar_url

  return (
    <div className="flex flex-col items-center px-6 pt-6 text-center">
      <div className="h-24 w-24 overflow-hidden rounded-full bg-bg">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted">
            {name[0]}
          </div>
        )}
      </div>

      <h1 className="mt-3 text-xl font-bold text-ink">{name}</h1>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
        <Wrench className="h-3.5 w-3.5" />
        {profile.category?.name ?? 'General services'}
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <VerificationBadge status={profile.verification_status} />
        <AvailabilityBadge isAvailable={profile.is_available} />
      </div>

      {profile.headline && (
        <p className="mt-3 max-w-xs text-sm text-ink-soft">{profile.headline}</p>
      )}

      <div className="mt-5 grid w-full grid-cols-3 gap-2">
        <Button
          variant={isFollowing ? 'secondary' : 'outline'}
          onClick={onToggleFollow}
          isLoading={isTogglingFollow}
          className="text-sm"
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
        <Button variant="outline" icon={MessageCircle} onClick={onContact} className="text-sm">
          Message
        </Button>
        <Button variant="outline" icon={Phone} className="text-sm">
          Call
        </Button>
      </div>

      <div className="mt-3 w-full">
        <Button onClick={onHire}>Request Service</Button>
      </div>
    </div>
  )
}