export const ROUTES = {
  ONBOARDING: '/',
  SELECT_ACCOUNT_TYPE: '/get-started',
  REGISTER: '/register',
  LOGIN: '/login',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  COMPLETE_PROFILE: '/complete-profile',
  HOME: '/home',
  LOCATION_PERMISSION: '/home/location',
  PROFESSIONAL_PROFILE: '/professionals/:id',
}

export function professionalProfilePath(id) {
  return `/professionals/${id}`
}