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
  DISCOVER: '/discover',
  LOCATION_PERMISSION: '/home/location',
  PROFESSIONAL_PROFILE: '/professionals/:id',
  FEED: '/feed',
  CREATE_POST: '/feed/create',
  POST_DETAILS: '/feed/:id',
  ALL_SERVICES: '/services',
  MY_JOBS: '/jobs',
  CREATE_JOB: '/jobs/create',
  JOB_REQUESTS: '/jobs/requests',
  JOB_DETAILS: '/jobs/:id',
  CONVERSATIONS: '/messages',
  CHAT: '/messages/:id',
  NOTIFICATIONS: '/notifications',
  JOB_TRACKING: '/jobs/:id/tracking',
  PROFILE: '/profile',
  EDIT_PROFESSIONAL_PROFILE: '/profile/professional',
  SETTINGS: '/settings',
  SAVED: '/saved',
  SAFETY_CENTER: '/safety',
  BLOCKED_USERS: '/safety/blocked',
  COMMUNITY_GUIDELINES: '/safety/guidelines',
  HELP_CENTER: '/help',
  CONTACT_SUPPORT: '/help/contact',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_VERIFICATION: '/admin/verification',
  ADMIN_JOBS: '/admin/jobs',
  ADMIN_REPORTS: '/admin/reports',
}

export function professionalProfilePath(id) {
  return `/professionals/${id}`
}

export function postDetailsPath(id) {
  return `/feed/${id}`
}

export function jobDetailsPath(id) {
  return `/jobs/${id}`
}

export function chatPath(id) {
  return `/messages/${id}`
}

export function jobTrackingPath(id) {
  return `/jobs/${id}/tracking`
}