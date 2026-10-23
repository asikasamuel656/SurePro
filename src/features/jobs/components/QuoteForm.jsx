import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function QuoteForm({ onSubmit, isSubmitting, error }) {
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!price) return
    onSubmit({ price: Number(price), message: message.trim() || null })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="Your quote (₦)"
        type="number"
        placeholder="10000"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-soft">
          Message (optional)
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Let them know how you'd approach the job..."
          className="w-full rounded-control border border-border bg-surface px-4 py-3 text-[15px] placeholder:text-muted focus:border-primary"
        />
      </label>
      {error && (
        <p className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger">
          {error.message ?? 'Could not submit your quote.'}
        </p>
      )}
      <Button type="submit" disabled={!price} isLoading={isSubmitting}>
        Submit quote
      </Button>
    </form>
  )
}