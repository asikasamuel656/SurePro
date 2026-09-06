import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clsx } from '@/utils/clsx'

export function AuthLayout({ children, onBack, showBack = true, className }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell flex min-h-dvh flex-col px-6 pb-8 pt-6">
        {showBack && (
          <button
            type="button"
            onClick={() => (onBack ? onBack() : navigate(-1))}
            className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-soft hover:bg-bg"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className={clsx('flex flex-1 flex-col', className)}>{children}</div>
      </div>
    </div>
  )
}