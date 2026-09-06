import { forwardRef, useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { clsx } from '@/utils/clsx'

export const PasswordInput = forwardRef(function PasswordInput(
  { label, error, className, ...rest },
  ref
) {
  const [visible, setVisible] = useState(false)

  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-soft">
          {label}
        </span>
      )}
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={clsx(
            'w-full rounded-control border bg-surface py-3 pl-11 pr-11 text-[15px] text-ink placeholder:text-muted transition-colors focus:border-primary',
            error ? 'border-danger' : 'border-border',
            className
          )}
          {...rest}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink-soft"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  )
})