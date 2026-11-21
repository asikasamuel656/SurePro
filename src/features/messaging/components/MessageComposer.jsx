
import { useState, useRef } from 'react'
import { Send, Image as ImageIcon, X, Loader2, Reply } from 'lucide-react'
import { uploadImage } from '@/lib/storage'

export function MessageComposer({
  conversationId,
  onSend,
  isSending,
  replyTo,
  onCancelReply,
}) {
  const [text, setText] = useState('')
  const [pendingImage, setPendingImage] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handlePickImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setIsUploading(true)

    try {
      const url = await uploadImage({
        bucket: 'messages',
        folder: conversationId,
        file,
      })
      setPendingImage({ url, previewUrl: url })
    } catch (err) {
      setError(err.message ?? 'Could not attach that image.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSending || isUploading || (!pendingImage && !text.trim())) return

    setError(null)

    try {
      if (pendingImage) {
        await onSend({
          messageType: 'image',
          imageUrl: pendingImage.url,
          content: text.trim() || null,
        })
        setPendingImage(null)
      } else {
        await onSend({
          messageType: 'text',
          content: text.trim(),
        })
      }

      setText('')
    } catch {
      setError("Couldn't send. Tap send to try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface p-3">
      {replyTo && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-border bg-bg p-3">
          <Reply className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-ink">Replying to message</p>
            <p className="mt-1 line-clamp-2 break-words text-xs text-muted">
              {replyTo.content || (replyTo.image_url ? 'Image attachment' : 'Message')}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface"
            aria-label="Cancel reply"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {pendingImage && (
        <div className="relative mb-2 inline-block">
          <img
            src={pendingImage.previewUrl}
            alt="Image to send"
            className="h-16 w-16 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={() => setPendingImage(null)}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {error && <p role="alert" className="mb-2 text-xs text-danger">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isSending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-bg disabled:opacity-50"
          aria-label="Attach image"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handlePickImage}
        />

        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={replyTo ? 'Write a reply...' : 'Type a message...'}
          aria-label="Message"
          className="min-w-0 flex-1 rounded-control border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted focus:border-primary"
        />

        <button
          type="submit"
          disabled={isSending || isUploading || (!text.trim() && !pendingImage)}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  )
}
