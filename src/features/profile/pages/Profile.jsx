import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings,
  Wrench,
  Bookmark,
  LogOut,
  ShieldAlert,
  HelpCircle,
  Camera,
} from 'lucide-react'

import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { PageContainer } from '@/components/layout/PageContainer'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import { signOut } from '@/features/auth/services/authApi'
import { uploadImage } from '@/lib/storage'

import { ACCOUNT_TYPES } from '@/constants/accountTypes'
import { ROUTES } from '@/constants/routes'

export function Profile() {
  const navigate = useNavigate()

  const { user, profile } = useAuth()
  const updateProfile = useUpdateProfile()

  const [isEditing, setIsEditing] = useState(false)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)

  const [previewUrl, setPreviewUrl] = useState(null)

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState(null)

  /*
   * Keep the edit form synchronized with the profile.
   *
   * This is important because the profile may load asynchronously.
   */
  useEffect(() => {
    if (!profile) return

    setFullName(profile.full_name ?? '')
    setPhone(profile.phone ?? '')
    setAvatarUrl(profile.avatar_url ?? null)
  }, [profile])

  /*
   * Clean up temporary browser preview URLs.
   */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const isProfessional =
    profile?.account_type === ACCOUNT_TYPES.PROFESSIONAL

  /*
   * Select and upload profile image.
   */
  const handlePickAvatar = async (event) => {
    const file = event.target.files?.[0]

    // Reset the input so selecting the same image again still triggers change.
    event.target.value = ''

    if (!file || !user?.id) return

    setAvatarError(null)

    /*
     * Show the image immediately while the upload happens.
     */
    const localPreview = URL.createObjectURL(file)

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(localPreview)
    setIsUploadingAvatar(true)

    try {
      const uploadedUrl = await uploadImage({
        bucket: 'avatars',
        folder: user.id,
        file,
      })

      /*
       * Store the real Supabase Storage URL.
       * This is what will eventually be saved to profiles.avatar_url.
       */
      setAvatarUrl(uploadedUrl)
    } catch (error) {
      console.error('❌ Avatar upload failed:', error)

      setAvatarError(
        error?.message ?? 'Could not upload that photo.'
      )

      /*
       * If upload failed, remove the temporary preview.
       */
      setPreviewUrl(null)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  /*
   * Save profile information.
   */
  const handleSave = () => {
    if (!user?.id) return

    if (isUploadingAvatar) return

    updateProfile.mutate(
      {
        fullName,
        phone,
        avatarUrl,
      },
      {
        onSuccess: () => {
          setIsEditing(false)
          setAvatarError(null)

          if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
          }
        },
      }
    )
  }

  /*
   * Cancel editing and restore the saved profile values.
   */
  const handleCancel = () => {
    setFullName(profile?.full_name ?? '')
    setPhone(profile?.phone ?? '')
    setAvatarUrl(profile?.avatar_url ?? null)

    setAvatarError(null)

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    updateProfile.reset()
    setIsEditing(false)
  }

  /*
   * Enter edit mode.
   */
  const handleStartEditing = () => {
    setFullName(profile?.full_name ?? '')
    setPhone(profile?.phone ?? '')
    setAvatarUrl(profile?.avatar_url ?? null)

    setAvatarError(null)
    updateProfile.reset()

    setIsEditing(true)
  }

  /*
   * Logout.
   */
  const handleLogout = async () => {
    await signOut()
    navigate(ROUTES.LOGIN)
  }

  const links = [
    isProfessional && {
      icon: Wrench,
      label: 'Edit professional profile',
      to: '/profile/professional',
    },

    {
      icon: Bookmark,
      label: 'Saved & Following',
      to: ROUTES.SAVED,
    },

    {
      icon: Settings,
      label: 'Settings',
      to: ROUTES.SETTINGS,
    },

    {
      icon: ShieldAlert,
      label: 'Safety Center',
      to: ROUTES.SAFETY_CENTER,
    },

    {
      icon: HelpCircle,
      label: 'Help & Support',
      to: ROUTES.HELP_CENTER,
    },
  ].filter(Boolean)

  /*
   * The image currently displayed.
   *
   * previewUrl is temporary and appears immediately after selection.
   * avatarUrl is the actual saved Supabase URL.
   */
  const displayedAvatarUrl = previewUrl || avatarUrl

  const fallbackLetter =
    profile?.full_name?.trim()?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    '?'

  return (
    <CustomerLayout>
      <div className="px-6 pb-2 pt-5">
        <h1 className="text-xl font-bold text-ink">
          Profile
        </h1>
      </div>

      <PageContainer className="px-6">
        {/* PROFILE HEADER */}
        <div className="flex items-center gap-4 rounded-card border border-border bg-surface p-4">
          <div className="relative h-16 w-16 shrink-0">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-bg">
              {displayedAvatarUrl ? (
                <img
                  src={displayedAvatarUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted">
                  {fallbackLetter}
                </div>
              )}
            </div>

            {isEditing && (
              <label
                className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white ${
                  isUploadingAvatar
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer'
                }`}
              >
                <Camera className="h-3.5 w-3.5" />

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePickAvatar}
                  disabled={isUploadingAvatar}
                />
              </label>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-ink">
              {profile?.full_name ?? 'Your name'}
            </p>

            <p className="truncate text-sm text-muted">
              {user?.email}
            </p>

            <span className="mt-1 inline-block rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-semibold text-primary">
              {isProfessional ? 'Professional' : 'Customer'}
            </span>
          </div>
        </div>

        {/* EDIT MODE */}
        {isEditing ? (
          <div className="mt-4 space-y-4 rounded-card border border-border bg-surface p-4">
            {/* AVATAR STATUS */}
            <div>
              <p className="text-sm font-semibold text-ink">
                Profile photo
              </p>

              <p className="mt-1 text-xs text-muted">
                Choose a JPEG, PNG, or WEBP image up to 5MB.
              </p>

              {isUploadingAvatar && (
                <p className="mt-2 text-xs font-medium text-primary">
                  Uploading profile photo...
                </p>
              )}

              {avatarError && (
                <p className="mt-2 text-xs font-medium text-danger">
                  {avatarError}
                </p>
              )}
            </div>

            {/* NAME */}
            <Input
              label="Full name"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              disabled={updateProfile.isPending}
            />

            {/* PHONE */}
            <Input
              label="Phone"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              disabled={updateProfile.isPending}
            />

            {/* SAVE ERROR */}
            {updateProfile.isError && (
              <p className="text-xs font-medium text-danger">
                {updateProfile.error?.message ??
                  'Could not update your profile.'}
              </p>
            )}

            {/* ACTIONS */}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                isLoading={
                  updateProfile.isPending ||
                  isUploadingAvatar
                }
                disabled={isUploadingAvatar}
                className="flex-1"
              >
                Save
              </Button>

              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={
                  updateProfile.isPending ||
                  isUploadingAvatar
                }
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <button
            type="button"
            onClick={handleStartEditing}
            className="mt-3 w-full rounded-control border border-border py-2.5 text-sm font-semibold text-ink-soft"
          >
            Edit profile
          </button>
        )}

        {/* PROFILE LINKS */}
        <div className="mt-6 divide-y divide-border rounded-card border border-border bg-surface">
          {links.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => navigate(link.to)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-ink"
            >
              <link.icon className="h-5 w-5 text-ink-soft" />

              {link.label}
            </button>
          ))}
        </div>

        {/* LOGOUT */}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-control border border-border py-3 text-sm font-semibold text-danger"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </PageContainer>

      <BottomNavigation />
    </CustomerLayout>
  )
}