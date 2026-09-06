import { useNavigate } from 'react-router-dom'
import { Search, Wallet, MapPinned, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'

const FEATURES = [
  { icon: Search, label: 'Discover trusted local professionals' },
  { icon: Wallet, label: 'Get quotes and hire with confidence' },
  { icon: MapPinned, label: 'Track your job from start to finish' },
  { icon: ShieldCheck, label: 'Build or check a verified reputation' },
]

export function Onboarding() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell flex min-h-dvh flex-col justify-between px-6 py-10">
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <Logo size="lg" />
          <div className="text-center">
            <p className="text-sm font-medium text-primary">Trusted pros, real connections.</p>
          </div>
          <ul className="w-full space-y-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-ink-soft">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <Button onClick={() => navigate(ROUTES.SELECT_ACCOUNT_TYPE)}>Get Started</Button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.LOGIN)}
            className="w-full py-2 text-center text-sm font-medium text-ink-soft hover:text-ink"
          >
            Already have an account? <span className="text-primary">Log in</span>
          </button>
        </div>
      </div>
    </div>
  )
}