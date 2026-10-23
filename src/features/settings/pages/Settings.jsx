import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { updatePassword } from '@/features/auth/services/authApi'
import { updateNotificationPreferences, updateUsername } from '@/features/profile/services/profileApi'
import { useQueryClient } from '@tanstack/react-query'
import { ROUTES } from '@/constants/routes'

const PREF_LABELS = {
  jobs: 'Job updates',
  messages: 'Messages',
  feed: 'Likes, comments & follows',
  marketing: 'Tips & promotions',
}

export function Settings() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()

  const [newPassword, setNewPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState('idle')
  const [username, setUsername] = useState(profile?.username ?? '')
  const [usernameStatus, setUsernameStatus] = useState('idle')
  const [prefs, setPrefs] = useState(
    profile?.notification_preferences ?? { jobs: true, messages: true, feed: true, marketing: false }
  )

  const handleUsernameSave = async () => {
    const cleanUsername = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')

    if (!cleanUsername) {
      setUsernameStatus('error')
      return
    }

    setUsernameStatus('saving')

    try {
      await updateUsername(user.id, cleanUsername)

      setUsername(cleanUsername)
      setUsernameStatus('saved')

      await queryClient.invalidateQueries({
        queryKey: ['profile', user.id],
      })
    } catch (error) {
      console.error('Username update failed:', error)

      setUsernameStatus('error')
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!newPassword) return
    setPasswordStatus('saving')
    try {
      await updatePassword(newPassword)
      setPasswordStatus('saved')
      setNewPassword('')
    } catch {
      setPasswordStatus('error')
    }
  }

  const togglePref = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    await updateNotificationPreferences(user.id, updated)
    queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell mx-auto max-w-2xl flex min-h-dvh flex-col">
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-ink">Settings</h1>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
          <div>
            <h2 className="mb-2 text-sm font-bold text-ink">Username</h2>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                />
              </div>
              <Button onClick={handleUsernameSave} isLoading={usernameStatus === 'saving'} className="w-auto px-4">
                Save
              </Button>
            </div>
            {usernameStatus === 'saved' && <p className="mt-1 text-sm text-primary">Username updated.</p>}
            {usernameStatus === 'error' && (
              <p className="mt-1 text-sm text-danger">
                Could not update username. It may already be taken or unavailable.
              </p>
            )}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-bold text-ink">Location</h2>
            <button
              type="button"
              onClick={() => navigate(ROUTES.LOCATION_PERMISSION)}
              className="w-full rounded-control border border-border p-3 text-left text-sm font-medium text-ink-soft"
            >
              Change your location
            </button>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-bold text-ink">Notifications</h2>
            <div className="divide-y divide-border rounded-card border border-border bg-surface">
              {Object.entries(PREF_LABELS).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between px-3 py-3">
                  <span className="text-sm text-ink">{label}</span>
                  <input
                    type="checkbox"
                    checked={!!prefs[key]}
                    onChange={() => togglePref(key)}
                    className="h-5 w-5 accent-primary"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-bold text-ink">Security</h2>
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <PasswordInput
                label="New password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {passwordStatus === 'saved' && <p className="text-sm text-primary">Password updated.</p>}
              {passwordStatus === 'error' && <p className="text-sm text-danger">Couldn't update your password.</p>}
              <Button type="submit" isLoading={passwordStatus === 'saving'} disabled={!newPassword}>
                Update password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}