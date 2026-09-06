import { MapPin, Bell, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLocationStore } from '@/store/locationStore'
import { ROUTES } from '@/constants/routes'

export function TopBar() {
  const navigate = useNavigate()
  const label = useLocationStore((s) => s.label)

  return (
    <div className="flex items-center justify-between px-6 pb-2 pt-5">
      <button
        type="button"
        onClick={() => navigate(ROUTES.LOCATION_PERMISSION)}
        className="flex items-center gap-1.5 text-sm font-semibold text-ink"
      >
        <MapPin className="h-4 w-4 text-primary" />
        <span className="max-w-[10rem] truncate">{label ?? 'Set your location'}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>
      <button
        type="button"
        aria-label="Notifications"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft"
      >
        <Bell className="h-5 w-5" />
      </button>
    </div>
  )
}