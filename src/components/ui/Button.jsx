import { Loader2 } from 'lucide-react'
import { clsx } from '@/utils/clsx'

const VARIANTS = {
  primary:
    'bg-primary text-white hover:bg-primary-dark disabled:bg-primary/50 shadow-sm',
  secondary:
    'bg-primary-light text-primary hover:bg-primary-light/70 disabled:opacity-50',
  outline:
    'bg-transparent text-ink border border-border hover:bg-bg disabled:opacity-50',
  ghost: 'bg-transparent text-ink-soft hover:bg-bg disabled:opacity-50',
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  type = 'button',
  className,
  icon: Icon,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex w-full items-center justify-center gap-2 rounded-control px-5 py-3.5 text-[15px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed',
        VARIANTS[variant],
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      {children}
    </button>
  )
}