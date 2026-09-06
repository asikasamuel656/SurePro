import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROUTES } from '@/constants/routes'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isEmailVerified, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!isEmailVerified) {
    return <Navigate to={ROUTES.VERIFY_EMAIL} replace />
  }

  return children
}