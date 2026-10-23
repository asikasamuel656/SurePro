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
 * Fetches available professionals, optionally filtered by category and a
 * search term. Search matches headline, full name, or @username (Part 2
 * S14/S17) -- distance is computed client-side (see utils/distance.js),
 * fine at SurePro's current scale.
 */
export async function fetchProfessionals({ categoryId, searchTerm } = {}) {
  let matchingProfileIds = null

  if (searchTerm) {
    const isUsernameSearch = searchTerm.trim().startsWith('@')
    const cleanTerm = searchTerm.trim().replace(/^@/, '')

    const profileQuery = supabase.from('profiles').select('id')
    const { data: matchedProfiles, error: profileError } = isUsernameSearch
      ? await profileQuery.ilike('username', `${cleanTerm}%`)
      : await profileQuery.or(`username.ilike.%${cleanTerm}%,full_name.ilike.%${cleanTerm}%`)

    if (profileError) throw profileError
    matchingProfileIds = (matchedProfiles ?? []).map((p) => p.id)
  }

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
      profile:profiles ( full_name, avatar_url, username )
    `
    )
    .eq('is_available', true)

  if (categoryId) query = query.eq('category_id', categoryId)

  if (searchTerm) {
    const idFilter = matchingProfileIds.length > 0 ? `,id.in.(${matchingProfileIds.join(',')})` : ''
    query = query.or(`headline.ilike.%${searchTerm}%${idFilter}`)
  }

  const { data, error } = await query
  if (error) throw error

  return data.map((row) => ({
    id: row.id,
    full_name: row.profile?.full_name ?? 'SurePro professional',
    username: row.profile?.username,
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