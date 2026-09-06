import { forwardRef } from 'react'
import { clsx } from '@/utils/clsx'

export const Input = forwardRef(function Input(
  { label, error, icon: Icon, className, ...rest },
  ref
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-soft">
          {label}
        </span>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full rounded-control border bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-muted transition-colors focus:border-primary',
            Icon && 'pl-11',
            error ? 'border-danger' : 'border-border',
            className
          )}
          {...rest}
        />
      </div>
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  )
})