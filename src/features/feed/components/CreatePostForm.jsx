import { useRef, useState } from 'react'
import {
  Camera,
  Check,
  ImagePlus,
  Lightbulb,
  Loader2,
  Sparkles,
  Video,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from '@/components/forms/ImageUploader'
import { clsx } from '@/utils/clsx'

const POST_TYPES = [
  {
    value: 'work',
    label: 'Work update',
  },
  {
    value: 'promotion',
    label: 'Promotion',
  },
]

function MediaPreview({ item, onRemove, index, total }) {
  const url = typeof item === 'string' ? item : item.url
  const type = typeof item === 'string' ? 'image' : item.type

  return (
    <div className="group relative">
      {/* Small square preview */}
      <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-border bg-bg shadow-sm">
        {type === 'video' ? (
          <video
            src={url}
            controls
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={url}
            alt={`Post media ${index + 1}`}
            className="h-full w-full object-cover"
          />
        )}

        {/* Before / After */}
        {total === 2 && type === 'image' && (
          <div className="absolute bottom-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-white backdrop-blur">
            {index === 0 ? 'BEFORE' : 'AFTER'}
          </div>
        )}

        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove media"
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-white shadow-sm backdrop-blur transition hover:bg-black"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function CreatePostForm({
  professionalId,
  onSubmit,
  isSubmitting,
}) {
  const inputRef = useRef(null)

  const [postType, setPostType] = useState('work')
  const [caption, setCaption] = useState('')
  const [mediaUrls, setMediaUrls] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const hasVideo = mediaUrls.some(
    (item) => typeof item !== 'string' && item.type === 'video'
  )

  const hasImage = mediaUrls.some(
    (item) =>
      typeof item === 'string' || item.type === 'image'
  )

  const canAddMore =
    mediaUrls.length === 0 ||
    (mediaUrls.length === 1 && hasImage && !hasVideo)

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files ?? [])

    if (!files.length) return

    setUploadError(null)

    if (files.length > 1) {
      setUploadError('Add one file at a time.')
      event.target.value = ''
      return
    }

    const file = files[0]

    if (file.type.startsWith('video/')) {
      setUploadError(
        'Short videos are supported, but the media uploader needs to be enabled for video uploads.'
      )

      event.target.value = ''
      return
    }

    if (!file.type.startsWith('image/')) {
      setUploadError(
        'Please choose an image or short video.'
      )

      event.target.value = ''
      return
    }

    if (!canAddMore) {
      setUploadError(
        'You can add up to 2 images, or 1 video.'
      )

      event.target.value = ''
      return
    }

    event.target.value = ''
  }

  const handleUploaded = (url) => {
    setUploadError(null)

    if (!canAddMore) {
      setUploadError(
        'You can add up to 2 images.'
      )
      return
    }

    setMediaUrls((current) => [
      ...current,
      {
        url,
        type: 'image',
      },
    ])
  }

  const removeMedia = (index) => {
    setMediaUrls((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    )

    setUploadError(null)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!professionalId) {
      setUploadError(
        'Your professional profile could not be found. Please try again.'
      )
      return
    }

    if (!mediaUrls.length) {
      setUploadError(
        'Add at least one photo or video before publishing.'
      )
      return
    }

    onSubmit({
      postType,
      caption,
      mediaUrls,
    })
  }

  const mediaDescription =
    mediaUrls.length === 2
      ? 'Your before & after photos are ready.'
      : mediaUrls.length === 1
        ? 'Add one more photo for a before & after.'
        : 'Add 1–2 photos or a short video.'

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Intro */}
      <section>
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />

          <h2 className="text-sm font-semibold text-text">
            Show your work
          </h2>
        </div>

        <p className="text-sm leading-6 text-muted">
          Share a recent job, transformation, or promotion
          and let customers see what you can do.
        </p>
      </section>

      {/* Post type */}
      <section className="rounded-2xl border border-border bg-surface p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Post type
        </p>

        <div className="grid grid-cols-2 gap-2">
          {POST_TYPES.map((type) => {
            const active = postType === type.value

            return (
              <button
                key={type.value}
                type="button"
                onClick={() =>
                  setPostType(type.value)
                }
                className={clsx(
                  'flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-xs transition',
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-bg text-muted hover:border-primary/40'
                )}
              >
                <span className="font-medium">
                  {type.label}
                </span>

                {active && (
                  <Check className="h-3.5 w-3.5" />
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* Media */}
      <section>
        <div className="mb-2.5">
          <h2 className="text-sm font-semibold text-text">
            Add your media
          </h2>

          <p className="mt-0.5 text-xs text-muted">
            {mediaDescription}
          </p>
        </div>

        {mediaUrls.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2.5">
            {mediaUrls.map((item, index) => (
              <MediaPreview
                key={`${item.url}-${index}`}
                item={item}
                index={index}
                total={mediaUrls.length}
                onRemove={() => removeMedia(index)}
              />
            ))}

            {canAddMore && (
              <div className="h-24 w-24">
                <ImageUploader
                  bucket="posts"
                  folder={professionalId}
                  onUploaded={handleUploaded}
                  className="h-24 w-24"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Compact upload button */}
            <div className="h-24 w-24 shrink-0">
              <ImageUploader
                bucket="posts"
                folder={professionalId}
                onUploaded={handleUploaded}
                className="h-24 w-24"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-text">
                Add a photo or video
              </p>

              <p className="mt-1 text-[11px] leading-4 text-muted">
                1–2 photos or one short video.
              </p>

              <div className="mt-2 flex items-center gap-3 text-[10px] text-muted">
                <span className="flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  Photos
                </span>

                <span className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  Video
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Guidance */}
        <div className="mt-3 flex gap-2.5 rounded-xl border border-border bg-surface p-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lightbulb className="h-3.5 w-3.5" />
          </div>

          <div>
            <p className="text-[11px] font-semibold text-text">
              Show the transformation
            </p>

            <p className="mt-0.5 text-[10px] leading-4 text-muted">
              Two photos work great for before & after
              results — especially for cleaning, repairs,
              painting, installations, and renovations.
            </p>
          </div>
        </div>

        {uploadError && (
          <p className="mt-2 rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">
            {uploadError}
          </p>
        )}
      </section>

      {/* Caption */}
      <section>
        <label
          htmlFor="post-caption"
          className="mb-2 block text-sm font-semibold text-text"
        >
          Tell customers about it
        </label>

        <textarea
          id="post-caption"
          value={caption}
          onChange={(event) =>
            setCaption(event.target.value)
          }
          placeholder="What did you work on? What changed? Give customers a reason to choose you..."
          rows={4}
          maxLength={500}
          className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-text outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
        />

        <div className="mt-1 flex justify-end">
          <span className="text-[10px] text-muted">
            {caption.length}/500
          </span>
        </div>
      </section>

      {/* Submit */}
      <Button
        type="submit"
        disabled={
          !professionalId ||
          !mediaUrls.length ||
          isSubmitting ||
          isUploading
        }
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Publishing...
          </>
        ) : (
          'Publish post'
        )}
      </Button>

      <p className="text-center text-[10px] leading-4 text-muted">
        Keep your media clear, relevant, and focused on
        the service or work you're sharing.
      </p>

      {/* Hidden input reserved for future video-enabled uploader */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
        className="hidden"
        onChange={handleFiles}
      />
    </form>
  )
}