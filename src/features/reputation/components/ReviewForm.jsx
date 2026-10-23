import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { clsx } from '@/utils/clsx'

export function ReviewForm({ existingReview, onSubmit, isSubmitting, error }) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState(existingReview?.comment ?? '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (rating === 0) return
    onSubmit({ rating, comment: comment.trim() || null })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1
          const filled = value <= (hoverRating || rating)
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
            >
              <Star
                className={clsx(
                  'h-7 w-7 transition-colors',
                  filled ? 'fill-warning text-warning' : 'text-border'
                )}
              />
            </button>
          )
        })}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Share details about your experience (optional)"
        className="w-full rounded-control border border-border bg-surface px-4 py-3 text-[15px] placeholder:text-muted focus:border-primary"
      />

      {error && (
        <p className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger">
          {error.message ?? 'Could not submit your review. Try again.'}
        </p>
      )}

      <Button type="submit" disabled={rating === 0} isLoading={isSubmitting}>
        {existingReview ? 'Update review' : 'Submit review'}
      </Button>
    </form>
  )
}