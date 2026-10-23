import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { clsx } from '@/utils/clsx'
import { signOut } from '@/features/auth/services/authApi'
import { ROUTES } from '@/constants/routes'

const TABS = [
  { label: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD },
  { label: 'Users', to: ROUTES.ADMIN_USERS },
  { label: 'Verification', to: ROUTES.ADMIN_VERIFICATION },
  { label: 'Jobs', to: ROUTES.ADMIN_JOBS },
  { label: 'Reports', to: ROUTES.ADMIN_REPORTS },
]

export function AdminLayout({ children }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate(ROUTES.LOGIN)
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto flex min-h-dvh max-w-4xl flex-col">
        <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
          <h1 className="text-lg font-bold text-ink">SurePro Admin</h1>
          <button type="button" onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-medium text-danger">
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>

        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-b border-border bg-surface px-4">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                clsx(
                  'whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold',
                  isActive ? 'border-primary text-primary' : 'border-transparent text-muted'
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}