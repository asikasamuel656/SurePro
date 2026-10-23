import { supabase } from '@/lib/supabase'

/**
 * The one place the app should ever ask "is this user allowed to do X".
 * Today this always resolves true for everyone (free plan has no
 * configured limits) -- when SurePro adds a real paid plan, only the data
 * in subscription_features changes, not this call site or any of the
 * features that use it.
 */
export async function canUseFeature(userId, featureKey) {
  const { data, error } = await supabase.rpc('can_use_feature', {
    p_user_id: userId,
    p_feature_key: featureKey,
  })
  if (error) throw error
  return data
}

/**
 * Passive usage logging -- fire-and-forget, never blocks the calling
 * action. Building this habit now means there's real usage data by the
 * time it's ever needed for a plan/limit decision.
 */
export async function logUsageEvent(userId, featureKey, { resourceId, metadata } = {}) {
  const { error } = await supabase
    .from('usage_events')
    .insert({ user_id: userId, feature_key: featureKey, resource_id: resourceId ?? null, metadata: metadata ?? null })
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[usage_events] failed to log', featureKey, error)
  }
}