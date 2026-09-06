import { ShieldCheck } from 'lucide-react'
import { clsx } from '@/utils/clsx'

export function Logo({ size = 'md', withWordmark = true, className }) {
  const badgeSize = { sm: 'h-9 w-9', md: 'h-14 w-14', lg: 'h-20 w-20' }[size]
  const iconSize = { sm: 'h-5 w-5', md: 'h-7 w-7', lg: 'h-10 w-10' }[size]
  const textSize = { sm: 'text-base', md: 'text-2xl', lg: 'text-3xl' }[size]

  return (
    <div className={clsx('flex flex-col items-center gap-3', className)}>
      <div
        className={clsx(
          'flex items-center justify-center rounded-2xl bg-primary text-white shadow-sm',
          badgeSize
        )}
      >
        <ShieldCheck className={iconSize} strokeWidth={2.25} />
      </div>
      {withWordmark && (
        <span className={clsx('font-bold tracking-tight text-ink', textSize)}>
          SurePro
        </span>
      )}
    </div>
  )
}