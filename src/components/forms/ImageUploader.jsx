import { useRef, useState } from 'react'
import { Camera, Loader2, ImageOff } from 'lucide-react'
import { uploadImage } from '@/lib/storage'
import { clsx } from '@/utils/clsx'

/**
 * Shared image uploader. `variant="avatar"` renders a round photo picker;
 * `variant="tile"` (default) renders a square drop-tile suitable for
 * portfolio/post/job-photo grids.
 */
export function ImageUploader({ bucket, folder, variant = 'tile', onUploaded, className }) {
  const inputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setIsUploading(true)
    try {
      const url = await uploadImage({ bucket, folder, file })
      onUploaded(url)
    } catch (err) {
      setError(err.message ?? 'Upload failed. Try again.')
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  if (variant === 'avatar') {
    return (
      <div className={clsx('flex flex-col items-center', className)}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="relative flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-border bg-bg text-muted"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Camera className="h-6 w-6" />
          )}
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleChange} />
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      </div>
    )
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-bg text-muted"
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <>
            <ImageOff className="h-5 w-5" />
            <span className="text-[10px]">Add photo</span>
          </>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleChange} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}