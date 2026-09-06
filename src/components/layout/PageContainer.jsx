import { clsx } from '@/utils/clsx'

export function PageContainer({ children, className }) {
  return (
    <div className={clsx('flex-1 overflow-y-auto pb-4', className)}>{children}</div>
  )
}