import { supabase } from '@/lib/supabase'

/**
 * Registers a new user with Supabase Auth and stashes the fields the
 * database trigger needs (full_name, phone, account_type) in user_metadata,
 * so `handle_new_user()` can create the matching profiles row server-side.
 */
export async function signUp({ fullName, email, phone, password, accountType }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        account_type: accountType,
      },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resendVerificationEmail(email) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${window.location.origin}/login` },
  })
  if (error) throw error
}

export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function completeProfile(userId, { fullName, phone, avatarUrl }) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone,
      avatar_url: avatarUrl,
      profile_completed: true,
    })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}