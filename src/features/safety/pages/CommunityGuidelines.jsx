import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

const SECTIONS = [
  {
    title: 'Be honest',
    body: 'Represent your skills, availability, and work accurately. Fake reviews, fake portfolios, or misrepresenting completed work are not allowed.',
  },
  {
    title: 'Be respectful',
    body: 'Harassment, hate speech, threats, or abusive language toward another user will not be tolerated.',
  },
  {
    title: 'Keep it safe',
    body: "Don't share information that could put someone's safety at risk. Report anything that feels unsafe immediately.",
  },
  {
    title: 'No fraud',
    body: 'Scams, fake job requests, and attempts to defraud customers or professionals will result in account removal.',
  },
  {
    title: 'Quality work',
    body: 'Professionals are expected to deliver the work they quote for. Customers are expected to describe jobs accurately.',
  },
]

export function CommunityGuidelines() {
  const navigate = useNavigate()

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
          <h1 className="text-base font-bold text-ink">Community Guidelines</h1>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="mb-1 text-sm font-bold text-ink">{s.title}</h2>
              <p className="text-sm text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}