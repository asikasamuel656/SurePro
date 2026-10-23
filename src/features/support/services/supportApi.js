import { supabase } from '@/lib/supabase'

export async function submitSupportTicket({ userId, subject, message }) {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({ user_id: userId, subject, message })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchMySupportTickets(userId) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}