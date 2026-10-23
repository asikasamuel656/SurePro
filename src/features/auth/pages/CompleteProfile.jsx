import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, User, Loader2 } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '@/components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { completeProfile } from '../services/authApi'
import { uploadImage } from '@/lib/storage'
import { ROUTES } from '@/constants/routes'

export function CompleteProfile() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  const handlePickPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setError(null)
    setIsUploading(true)
    try {
      const url = await uploadImage({ bucket: 'avatars', folder: user.id, file })
      setAvatarUrl(url)
    } catch (err) {
      setError(err.message ?? 'Could not upload that photo.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFinish = async () => {
    if (avatarUrl && user) {
      await completeProfile(user.id, {
        fullName: profile?.full_name,
        phone: profile?.phone,
        avatarUrl,
      })
    }
    navigate(ROUTES.HOME)
  }

  return (
    <AuthLayout showBack={false}>
      <h1 className="text-2xl font-bold text-ink">Complete your profile</h1>
      <p className="mt-1 text-sm text-muted">Add a photo so people recognize you on SurePro.</p>

      <div className="mt-8 flex flex-1 flex-col items-center">
        <label className="relative flex h-28 w-28 cursor-pointer items-center justify-center rounded-full border border-dashed border-border bg-bg text-muted">
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : avatarUrl ? (
            <img src={avatarUrl} alt="Profile preview" className="h-full w-full rounded-full object-cover" />
          ) : (
            <User className="h-10 w-10" />
          )}
          <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
            <Camera className="h-4 w-4" />
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePickPhoto}
            disabled={isUploading}
          />
        </label>

        {error && <p className="mt-2 text-center text-xs text-danger">{error}</p>}

        <p className="mt-4 text-center text-sm text-ink-soft">
          {profile?.full_name ?? 'Welcome to SurePro'}
        </p>
      </div>

      <div className="space-y-3 pt-4">
        <Button onClick={handleFinish} disabled={isUploading}>
          Finish
        </Button>
        <Button variant="ghost" onClick={() => navigate(ROUTES.HOME)}>
          Skip for now
        </Button>
      </div>
    </AuthLayout>
  )
}