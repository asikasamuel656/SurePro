import { Home, Search, LayoutGrid, Briefcase, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { clsx } from '@/utils/clsx'
import { ROUTES } from '@/constants/routes'

// Feed / Jobs / Profile are intentionally inert stubs here — those features
// ship in Phases 4, 6 and 9. Only Home + Discover are wired up in Phase 2.
const TABS = [
  { icon: Home, label: 'Home', to: ROUTES.HOME, enabled: true },
  { icon: Search, label: 'Discover', to: ROUTES.HOME, enabled: true },
  { icon: LayoutGrid, label: 'Feed', to: null, enabled: false },
  { icon: Briefcase, label: 'Jobs', to: null, enabled: false },
  { icon: User, label: 'Profile', to: null, enabled: false },
]

export function BottomNavigation() {
  return (
    <nav className="safe-bottom sticky bottom-0 z-10 border-t border-border bg-surface">
      <div className="mobile-shell flex items-stretch justify-between px-2 py-1.5">
        {TABS.map(({ icon: Icon, label, to, enabled }) =>
          enabled ? (
            <NavLink
              key={label}
              to={to}
              end
              className={({ isActive }) =>
                clsx(
                  'flex flex-1 flex-col items-center gap-1 rounded-control py-2 text-[11px] font-medium',
                  isActive ? 'text-primary' : 'text-muted'
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ) : (
            <button
              key={label}
              type="button"
              disabled
              className="flex flex-1 flex-col items-center gap-1 rounded-control py-2 text-[11px] font-medium text-muted/50"
              title="Coming soon"
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          )
        )}
      </div>
    </nav>
  )
}