import { supabase } from '@/lib/supabase'

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

/**
 * Fetches available professionals, optionally filtered by category. Distance
 * is computed client-side (see utils/distance.js) since we're not running
 * PostGIS at this stage — fine at SurePro's current scale.
 */
export async function fetchProfessionals({ categoryId, searchTerm } = {}) {
  let query = supabase
    .from('professionals')
    .select(
      `
      id,
      headline,
      rate_min,
      rate_max,
      latitude,
      longitude,
      rating,
      completed_jobs,
      is_available,
      category:categories ( id, name, icon ),
      profile:profiles ( full_name, avatar_url )
    `
    )
    .eq('is_available', true)

  if (categoryId) query = query.eq('category_id', categoryId)
  if (searchTerm) query = query.ilike('headline', `%${searchTerm}%`)

  const { data, error } = await query
  if (error) throw error

  return data.map((row) => ({
    id: row.id,
    full_name: row.profile?.full_name ?? 'SurePro professional',
    avatar_url: row.profile?.avatar_url ?? null,
    category_name: row.category?.name ?? 'General services',
    rating: row.rating,
    completed_jobs: row.completed_jobs,
    is_available: row.is_available,
    latitude: row.latitude,
    longitude: row.longitude,
    headline: row.headline,
  }))
}