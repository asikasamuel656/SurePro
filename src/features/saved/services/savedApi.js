import { supabase } from '@/lib/supabase'

export async function fetchSavedProfessionals(userId) {
  const { data, error } = await supabase
    .from('saved_professionals')
    .select(
      `professional:professionals ( id, rating, completed_jobs, is_available, category:categories ( name ), profile:profiles ( full_name, avatar_url ) )`
    )
    .eq('user_id', userId)
  if (error) throw error
  return data.map((r) => r.professional).filter(Boolean)
}

export async function toggleSaveProfessional(professionalId, userId, isSaved) {
  if (isSaved) {
    const { error } = await supabase
      .from('saved_professionals')
      .delete()
      .eq('professional_id', professionalId)
      .eq('user_id', userId)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('saved_professionals')
      .insert({ professional_id: professionalId, user_id: userId })
    if (error) throw error
  }
}

export async function fetchSavedPosts(userId) {
  const { data, error } = await supabase
    .from('saved_posts')
    .select(
      `post:posts ( id, caption, created_at, media:post_media ( media_url, sort_order ), professional:professionals ( profile:profiles ( full_name, avatar_url ) ) )`
    )
    .eq('user_id', userId)
  if (error) throw error
  return data.map((r) => r.post).filter(Boolean)
}

export async function fetchFollowing(userId) {
  const { data, error } = await supabase
    .from('follows')
    .select(
      `professional:professionals ( id, rating, completed_jobs, is_available, category:categories ( name ), profile:profiles ( full_name, avatar_url ) )`
    )
    .eq('follower_id', userId)
  if (error) throw error
  return data.map((r) => r.professional).filter(Boolean)
}