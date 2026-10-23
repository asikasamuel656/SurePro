import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { submitSupportTicket, fetchMySupportTickets } from '../services/supportApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function ContactSupport() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { data: tickets = [] } = useQuery({
    queryKey: ['supportTickets', user?.id],
    queryFn: () => fetchMySupportTickets(user.id),
    enabled: !!user?.id,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    setIsSubmitting(true)
    try {
      await submitSupportTicket({ userId: user.id, subject, message })
      setSubject('')
      setMessage('')
      setSubmitted(true)
      queryClient.invalidateQueries({ queryKey: ['supportTickets', user?.id] })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell flex min-h-dvh flex-col">
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-ink">Contact support</h1>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-control border border-border bg-surface px-4 py-3 text-[15px] placeholder:text-muted focus:border-primary"
              />
            </label>
            {submitted && <p className="text-sm text-primary">Ticket submitted — we'll get back to you soon.</p>}
            <Button type="submit" isLoading={isSubmitting} disabled={!subject.trim() || !message.trim()}>
              Submit
            </Button>
          </form>

          {tickets.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-bold text-ink">Your tickets</h2>
              <div className="space-y-2">
                {tickets.map((t) => (
                  <div key={t.id} className="rounded-card border border-border bg-surface p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink">{t.subject}</p>
                      <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-semibold text-muted">
                        {t.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{t.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}