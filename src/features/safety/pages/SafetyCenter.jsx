import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ShieldCheck, UserX, BookOpen, MessageCircleWarning } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

const LINKS = [
  { icon: BookOpen, label: 'Community Guidelines', to: ROUTES.COMMUNITY_GUIDELINES },
  { icon: UserX, label: 'Blocked users', to: ROUTES.BLOCKED_USERS },
  { icon: MessageCircleWarning, label: 'Help & Support', to: ROUTES.HELP_CENTER },
]

export function SafetyCenter() {
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
          <h1 className="text-base font-bold text-ink">Safety Center</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-6 flex items-center gap-3 rounded-card border border-primary/30 bg-primary-light p-4">
            <ShieldCheck className="h-8 w-8 shrink-0 text-primary" />
            <p className="text-sm text-ink">
              SurePro is built on trust. Verified badges, reviews, and reporting tools help keep the
              community safe — here's where to find them.
            </p>
          </div>

          <div className="divide-y divide-border rounded-card border border-border bg-surface">
            {LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => navigate(link.to)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-ink"
              >
                <link.icon className="h-5 w-5 text-ink-soft" />
                {link.label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-2 text-sm text-muted">
            <p className="font-semibold text-ink">A few safety tips:</p>
            <p>• Keep communication and payment on-platform where possible.</p>
            <p>• Check verification badges and reviews before hiring.</p>
            <p>• Report anything that feels off — you can do it from any profile, post, or job.</p>
          </div>
        </div>
      </div>
    </div>
  )
}