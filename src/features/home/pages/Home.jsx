import { CustomerHome } from './CustomerHome'
import { ProfessionalHome } from './ProfessionalHome'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ACCOUNT_TYPES } from '@/constants/accountTypes'

/**
 * Home must NOT be identical for both roles (Part 2 S8) -- this just
 * routes to the right dashboard based on account type.
 */
export function Home() {
  const { profile } = useAuth()
  const isProfessional = profile?.account_type === ACCOUNT_TYPES.PROFESSIONAL
  return isProfessional ? <ProfessionalHome /> : <CustomerHome />
}