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
      completion_rate,
      response_rate,
      repeat_customers,
      category:categories ( id, name, icon ),
      profile:profiles ( full_name, avatar_url, username )
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

export async function updateProfessionalProfile(professionalId, updates) {
  const { data, error } = await supabase
    .from('professionals')
    .update(updates)
    .eq('id', professionalId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function addService({ professionalId, name, description, priceMin, priceMax }) {
  const { data, error } = await supabase
    .from('services')
    .insert({ professional_id: professionalId, name, description, price_min: priceMin || null, price_max: priceMax || null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteService(serviceId) {
  const { error } = await supabase.from('services').delete().eq('id', serviceId)
  if (error) throw error
}

export async function addPortfolioItem({ professionalId, imageUrl, caption }) {
  const { data, error } = await supabase
    .from('portfolio_items')
    .insert({ professional_id: professionalId, image_url: imageUrl, caption })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePortfolioItem(itemId) {
  const { error } = await supabase.from('portfolio_items').delete().eq('id', itemId)
  if (error) throw error
}