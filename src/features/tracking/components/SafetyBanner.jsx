import { ShieldCheck } from 'lucide-react'

export function SafetyBanner() {
  return (
    <div className="flex items-center gap-2 rounded-card bg-primary-light px-3 py-2.5">
      <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
      <div>
        <p className="text-xs font-semibold text-primary">Safety first</p>
        <p className="text-[11px] text-primary/80">You're in safe hands. Report anything that feels off, anytime.</p>
      </div>
    </div>
  )
}