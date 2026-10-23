import { supabase } from '@/lib/supabase'

export async function submitReview({ professionalId, customerId, rating, comment }) {
  const { data, error } = await supabase
    .from('reviews')
    .upsert(
      { professional_id: professionalId, customer_id: customerId, rating, comment },
      { onConflict: 'professional_id,customer_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchMyReview(professionalId, customerId) {
  if (!customerId) return null
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('customer_id', customerId)
    .maybeSingle()
  if (error) throw error
  return data
}

/** True only if this customer has a completed job with this professional --
 * matches the job-verified review requirement (reviews RLS enforces the
 * same rule server-side; this just drives the UI). */
export async function fetchCanReview(professionalId, customerId) {
  if (!customerId) return false
  const { data, error } = await supabase
    .from('jobs')
    .select('id')
    .eq('customer_id', customerId)
    .eq('accepted_professional_id', professionalId)
    .eq('status', 'completed')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return !!data
}

export async function fetchBadges(professionalId) {
  const { data, error } = await supabase
    .from('professional_badges')
    .select('awarded_at, badge:badges ( id, name, description, icon )')
    .eq('professional_id', professionalId)
  if (error) throw error
  return data.map((row) => ({ ...row.badge, awarded_at: row.awarded_at }))
}