import { supabase } from '@/lib/supabase'

export async function fetchProfessionalProfile(professionalId) {
  const { data, error } = await supabase
    .from('professionals')
    .select(
      `
      id,
      headline,
      bio,
      rate_min,
      rate_max,
      rating,
      completed_jobs,
      is_available,
      verification_status,
      years_experience,
      category:categories ( id, name, icon ),
      profile:profiles ( full_name, avatar_url, phone )
    `
    )
    .eq('id', professionalId)
    .single()
  if (error) throw error
  return data
}

export async function fetchServices(professionalId) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('professional_id', professionalId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchPortfolio(professionalId) {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('professional_id', professionalId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchReviews(professionalId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, customer:profiles ( full_name, avatar_url )')
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data
}

export async function fetchFollowerCount(professionalId) {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('professional_id', professionalId)
  if (error) throw error
  return count ?? 0
}

export async function fetchIsFollowing(professionalId, userId) {
  if (!userId) return false
  const { data, error } = await supabase
    .from('follows')
    .select('professional_id')
    .eq('professional_id', professionalId)
    .eq('follower_id', userId)
    .maybeSingle()
  if (error) throw error
  return !!data
}

export async function follow(professionalId, userId) {
  const { error } = await supabase
    .from('follows')
    .insert({ professional_id: professionalId, follower_id: userId })
  if (error) throw error
}

export async function unfollow(professionalId, userId) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('professional_id', professionalId)
    .eq('follower_id', userId)
  if (error) throw error
}