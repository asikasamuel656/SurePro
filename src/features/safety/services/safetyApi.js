import { supabase } from '@/lib/supabase'

export async function fileReport({ reporterId, targetType, targetId, reason, details }) {
  const { data, error } = await supabase
    .from('reports')
    .insert({ reporter_id: reporterId, target_type: targetType, target_id: targetId, reason, details })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function blockUser(blockerId, blockedId) {
  const { error } = await supabase.from('blocks').insert({ blocker_id: blockerId, blocked_id: blockedId })
  if (error) throw error
}

export async function unblockUser(blockerId, blockedId) {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
  if (error) throw error
}

export async function fetchBlockedUsers(blockerId) {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocked_id, blocked:profiles!blocks_blocked_id_fkey ( full_name, avatar_url )')
    .eq('blocker_id', blockerId)
  if (error) throw error
  return data
}

export async function fetchBlockedIds(blockerId) {
  if (!blockerId) return []
  const { data, error } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', blockerId)
  if (error) throw error
  return data.map((row) => row.blocked_id)
}

export async function isBlocked(blockerId, blockedId) {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .maybeSingle()
  if (error) throw error
  return !!data
}