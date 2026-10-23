/**
 * Minimal, provider-agnostic event/error logging.
 *
 * This intentionally does NOT integrate a paid analytics/monitoring
 * service (Sentry, Mixpanel, etc.) -- that would violate the "no
 * unnecessary paid services" product rule for an early-stage app. Instead
 * this gives every call site a single, stable interface. When SurePro is
 * ready to add a real provider, only this file needs to change --
 * everywhere else keeps calling trackEvent()/logError() exactly as-is.
 */

const isDev = import.meta.env.DEV

export function trackEvent(name, properties = {}) {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.info(`[analytics] ${name}`, properties)
  }
  // Swap this file's body for a real provider call (e.g. posthog.capture,
  // Sentry breadcrumbs) when one is added -- no other file needs to change.
}

export function logError(error, context = {}) {
  // eslint-disable-next-line no-console
  console.error('[error]', error, context)
  // Swap for Sentry.captureException(error, { extra: context }) later.
}