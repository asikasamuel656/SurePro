
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function QuoteForm({
  onSubmit,
  isSubmitting,
  error,
  initialValues = {},
  submitLabel = 'Submit quote',
}) {
 const [price, setPrice] = useState(
    initialValues.amount?.toString() || ''
  )
  const [message, setMessage] = useState(
    initialValues.message || ''
  )
  const [proposedDate, setProposedDate] = useState(
    initialValues.proposed_date || ''
  )
  const [proposedTime, setProposedTime] = useState(
    initialValues.proposed_time || ''
  )  
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!price || Number(price) <= 0) return

    onSubmit({
      price: Number(price),
      amount: Number(price),
      message: message.trim() || null,
      proposedDate: proposedDate || null,
      proposedTime: proposedTime || null,
    })
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

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-soft">
          Proposed date (optional)
        </span>
        <input
          type="date"
          value={proposedDate}
          onChange={(e) => setProposedDate(e.target.value)}
          className="w-full rounded-control border border-border bg-surface px-4 py-3 text-[15px]"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-soft">
          Proposed time (optional)
        </span>
        <input
          type="time"
          value={proposedTime}
          onChange={(e) => setProposedTime(e.target.value)}
          className="w-full rounded-control border border-border bg-surface px-4 py-3 text-[15px]"
        />
      </label>

      {error && (
        <p className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger">
          {error.message ?? 'Could not save your quote.'}
        </p>
      )}

      <Button
        type="submit"
        disabled={!price || Number(price) <= 0}
        isLoading={isSubmitting}
      >
        {submitLabel}
      </Button>
    </form>
  )
}
