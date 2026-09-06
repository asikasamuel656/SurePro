import { Routes, Route } from 'react-router-dom'
import { Onboarding } from '@/features/auth/pages/Onboarding'
import { SelectAccountType } from '@/features/auth/pages/SelectAccountType'
import { Register } from '@/features/auth/pages/Register'
import { Login } from '@/features/auth/pages/Login'
import { VerifyEmail } from '@/features/auth/pages/VerifyEmail'
import { ForgotPassword } from '@/features/auth/pages/ForgotPassword'
import { ResetPassword } from '@/features/auth/pages/ResetPassword'
import { CompleteProfile } from '@/features/auth/pages/CompleteProfile'
import { Home } from '@/features/discovery/pages/Home'
import { LocationPermission } from '@/features/location/pages/LocationPermission'
import { ProfessionalProfile } from '@/features/professionals/pages/ProfessionalProfile'
import { ProtectedRoute } from './ProtectedRoute'
import { ROUTES } from '@/constants/routes'

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.ONBOARDING} element={<Onboarding />} />
      <Route path={ROUTES.SELECT_ACCOUNT_TYPE} element={<SelectAccountType />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

      <Route
        path={ROUTES.COMPLETE_PROFILE}
        element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.LOCATION_PERMISSION}
        element={
          <ProtectedRoute>
            <LocationPermission />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROFESSIONAL_PROFILE}
        element={
          <ProtectedRoute>
            <ProfessionalProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}