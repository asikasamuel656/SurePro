import { useState } from 'react'
import { Send } from 'lucide-react'

export function CommentBox({ onSubmit, isSubmitting }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    onSubmit(value.trim())
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 rounded-control border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted focus:border-primary"
      />
      <button
        type="submit"
        disabled={!value.trim() || isSubmitting}
        aria-label="Send comment"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  )
}