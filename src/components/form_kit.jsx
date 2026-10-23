// src/components/form_kit.jsx
// ─────────────────────────────────────────────────────────────
// Shared registration UI. customer_register.jsx already imports
// Input/Btn/StepBar/StepProfile from here — this file makes that
// import real. provider_register.jsx uses the same Input/Textarea/
// Btn/StepBar for consistency, and its own profile step can switch
// to <StepProfile> too instead of keeping a second copy of the same
// avatar/bio form.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { uploadToCloudinary } from '../services/cloudinary'

export function Input({ label, error, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <input
        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition ${error ? 'border-red-400' : 'border-gray-200'}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <textarea
        rows={3}
        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none ${error ? 'border-red-400' : 'border-gray-200'}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export function Btn({ loading, children, ...props }) {
  return (
    <button
      className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-medium text-sm py-3.5 rounded-xl transition-colors"
      disabled={loading}
      {...props}
    >
      {loading ? 'Please wait…' : children}
    </button>
  )
}

export function StepBar({ current, total }) {
  return (
    <div className="flex gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i < current ? 'bg-emerald-600' : 'bg-gray-200'}`} />
      ))}
    </div>
  )
}

// Shared bio + avatar step. onSubmit receives { avatarFile, bio } —
// the caller decides what to do with them (upload + save).
export function StepProfile({
  title = 'Your profile',
  subtitle = "This is what others will see about you.",
  initialBio = '',
  initialAvatarUrl = null,
  onSubmit,
  onSkip,
  onBack,
}) {
  const [bio, setBio] = useState(initialBio)
  const [avatarFile, setAvatarFile] = useState(null)
  const [preview, setPreview] = useState(initialAvatarUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function pickAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Please select an image file.')
    if (file.size > 5 * 1024 * 1024) return setError('Profile image must be smaller than 5MB.')
    setError('')
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onSubmit({ avatarFile, bio: bio.trim() })
    } catch (err) {
      setError(err.message || 'Failed to save your profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-sm text-gray-500 mb-6">{subtitle}</p>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile photo</label>
        <label className="flex items-center gap-4 cursor-pointer">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-2 ${preview ? 'border-emerald-400' : 'border-dashed border-gray-300'}`}>
            {preview ? <img src={preview} alt="Profile preview" className="w-full h-full object-cover" /> : <span className="text-2xl">👤</span>}
          </div>
          <span className="text-sm text-emerald-600 font-medium">{preview ? 'Change photo' : 'Upload photo'}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickAvatar} />
        </label>
      </div>

      <Textarea label="Short bio" placeholder="Tell people a bit about yourself…" value={bio} onChange={(e) => { setBio(e.target.value); setError('') }} />

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="flex gap-3">
        {onBack && <button type="button" onClick={onBack} disabled={loading} className="w-1/3 border border-gray-200 text-gray-700 font-medium text-sm py-3.5 rounded-xl disabled:opacity-50">Back</button>}
        <div className={onBack ? 'w-2/3' : 'flex-1'}><Btn loading={loading}>Finish →</Btn></div>
      </div>

      {onSkip && (
        <button type="button" onClick={onSkip} disabled={loading} className="block mx-auto text-xs text-gray-400 hover:text-gray-600 mt-3">
          Skip for now
        </button>
      )}
    </form>
  )
}

// re-exported so callers that just want the upload helper don't need
// a separate import path
export { uploadToCloudinary }