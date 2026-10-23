import { supabase } from '@/lib/supabase'

/**
 * Update the currently authenticated user's basic profile.
 */
export async function updateOwnProfile(
  userId,
  { fullName, phone, avatarUrl }
) {
  if (!userId) {
    throw new Error('User is not authenticated.')
  }

  const updates = {
    full_name: fullName?.trim() ?? '',
    phone: phone?.trim() ?? '',
    avatar_url: avatarUrl || null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('❌ Profile update failed:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })

    throw error
  }

  return data
}

/**
 * Update username.
 */
export async function updateUsername(userId, username) {
  if (!userId) {
    throw new Error('User is not authenticated.')
  }

  const clean = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')

  if (!clean) {
    throw new Error('Username cannot be empty.')
  }

  if (clean.length < 3) {
    throw new Error('Username must be at least 3 characters.')
  }

  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', clean)
    .neq('id', userId)
    .maybeSingle()

  if (checkError) {
    throw checkError
  }

  if (existingUser) {
    throw new Error('Username is already taken.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      username: clean,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * Update notification preferences.
 */
export async function updateNotificationPreferences(
  userId,
  preferences
) {
  if (!userId) {
    throw new Error('User is not authenticated.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      notification_preferences: preferences,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * Creates the professionals row a newly-professional account needs.
 */
export async function setUpProfessionalProfile(
  userId,
  { categoryId, headline }
) {
  if (!userId) {
    throw new Error('User is not authenticated.')
  }

  const { data, error } = await supabase
    .from('professionals')
    .insert({
      id: userId,
      category_id: categoryId,
      headline,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * Fetch the authenticated user's professional row.
 */
export async function fetchOwnProfessionalRow(userId) {
  if (!userId) {
    throw new Error('User is not authenticated.')
  }

  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}