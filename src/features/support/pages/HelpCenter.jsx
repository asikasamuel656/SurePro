import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  ChevronLeft,
  ChevronDown,
  MessageSquarePlus,
} from 'lucide-react'
import { clsx } from '@/utils/clsx'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ACCOUNT_TYPES } from '@/constants/accountTypes'

const CUSTOMER_FAQS = [
  {
    q: 'How do I hire a professional?',
    a: 'Post a job describing what you need, include your location and budget, then review quotes from professionals who respond.',
  },
  {
    q: 'How do I choose between professionals?',
    a: 'Review their quote amount, message, rating, completed jobs and proposed schedule before accepting a quote.',
  },
  {
    q: 'What happens after I accept a quote?',
    a: 'The professional becomes assigned to your job and the job moves into the accepted stage. You can then communicate with the professional through the app.',
  },
  {
    q: 'How do I track my job?',
    a: 'Once your professional is on the way, the job details page will provide the tracking option when available.',
  },
  {
    q: 'What if I have a problem with a professional?',
    a: 'Use Contact Support to submit a complaint. Include the job details and explain what happened so the support team can review it.',
  },
  {
    q: 'How do I get support?',
    a: 'Open Contact Support, enter a clear subject and describe your issue. Your submitted ticket will appear under Your tickets.',
  },
  {
    q: 'Can I cancel a job?',
    a: 'You can cancel an active job from the job details page while it is still eligible for cancellation.',
  },
]

const PROFESSIONAL_FAQS = [
  {
    q: 'How do I get customers?',
    a: 'Complete your professional profile, keep your information accurate, respond to suitable job requests and consistently provide useful content and professional service.',
  },
  {
    q: 'How do I get more job opportunities?',
    a: 'Check available job requests regularly and submit clear, competitive quotes that explain your price, approach and availability.',
  },
  {
    q: 'How can I build a strong reputation?',
    a: 'Complete jobs professionally, communicate clearly, arrive as agreed and provide a good customer experience. Your completed jobs and customer ratings contribute to your profile.',
  },
  {
    q: 'How can posting help me attract customers?',
    a: 'Consistent, useful posts can help people discover your expertise. Share work-related tips, examples of your services and helpful information without making misleading claims.',
  },
  {
    q: 'How do quotes work?',
    a: 'When you find a suitable open job request, submit your price and an optional message explaining how you would approach the work.',
  },
  {
    q: 'What happens when a customer accepts my quote?',
    a: 'The job becomes assigned to you. You can then progress through the job stages and communicate with the customer.',
  },
  {
    q: 'What should I do if I have a problem with a customer?',
    a: 'Use Contact Support and provide the job information, what happened and any relevant details so the support team can review the issue.',
  },
]

export function HelpCenter() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [openIndex, setOpenIndex] = useState(null)

  const isProfessional =
    profile?.account_type === ACCOUNT_TYPES.PROFESSIONAL

  const faqs = isProfessional
    ? PROFESSIONAL_FAQS
    : CUSTOMER_FAQS

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

          <div>
            <h1 className="text-base font-bold text-ink">
              Help Center
            </h1>

            <p className="text-xs text-muted">
              {isProfessional
                ? 'Professional guide'
                : 'Customer guide'}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-4 rounded-card border border-border bg-surface p-4">
            <h2 className="text-sm font-bold text-ink">
              {isProfessional
                ? 'Grow your professional profile'
                : 'Get the right professional for your job'}
            </h2>

            <p className="mt-1 text-sm leading-5 text-muted">
              {isProfessional
                ? 'Use SurePro consistently, respond to relevant jobs, communicate clearly and build a strong record through completed work and customer feedback.'
                : 'Post clear job requests, review professional quotes carefully and use the information available on each professional before accepting a quote.'}
            </p>
          </div>

          <div className="divide-y divide-border rounded-card border border-border bg-surface">
            {faqs.map((faq, i) => (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(
                      openIndex === i ? null : i
                    )
                  }
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <span className="pr-4 text-sm font-medium text-ink">
                    {faq.q}
                  </span>

                  <ChevronDown
                    className={clsx(
                      'h-4 w-4 shrink-0 text-muted transition-transform',
                      openIndex === i && 'rotate-180'
                    )}
                  />
                </button>

                {openIndex === i && (
                  <p className="px-4 pb-3 text-sm leading-5 text-muted">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.CONTACT_SUPPORT)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-control bg-primary py-3 text-sm font-semibold text-white"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Contact support
          </button>
        </div>
      </div>
    </div>
  )
}