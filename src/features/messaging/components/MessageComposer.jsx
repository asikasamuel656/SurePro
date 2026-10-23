import { useState, useRef } from 'react'
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { uploadImage } from '@/lib/storage'

export function MessageComposer({ conversationId, onSend, isSending }) {
  const [text, setText] = useState('')
  const [pendingImage, setPendingImage] = useState(null) // { url, previewUrl }
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handlePickImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setIsUploading(true)
    try {
      const url = await uploadImage({ bucket: 'messages', folder: conversationId, file })
      setPendingImage({ url, previewUrl: url })
    } catch (err) {
      setError(err.message ?? 'Could not attach that image.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pendingImage && !text.trim()) return
    setError(null)

    try {
      if (pendingImage) {
        await onSend({ messageType: 'image', imageUrl: pendingImage.url, content: text.trim() || null })
        setPendingImage(null)
      } else {
        await onSend({ messageType: 'text', content: text.trim() })
      }
      setText('')
    } catch {
      // Keep the typed text and attached image so the person can retry
      // without losing what they wrote -- failed sends should never
      // silently disappear.
      setError("Couldn't send. Tap send to try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-surface p-3">
      {error && <p className="mb-2 text-xs text-danger">{error}</p>}

      {pendingImage && (
        <div className="relative mb-2 inline-block">
          <img src={pendingImage.previewUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
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

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-bg disabled:opacity-50"
          aria-label="Attach image"
        >
          {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
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
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-control border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted focus:border-primary"
        />
        <button
          type="submit"
          disabled={isSending || (!text.trim() && !pendingImage)}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}