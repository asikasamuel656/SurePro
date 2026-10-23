import { supabase } from '@/lib/supabase'

export async function fetchIsFollowing(followerId, followedId) {
  if (!followerId) return false
  const { data, error } = await supabase
    .from('user_follows')
    .select('followed_id')
    .eq('follower_id', followerId)
    .eq('followed_id', followedId)
    .maybeSingle()
  if (error) throw error
  return !!data
}

export async function follow(followerId, followedId) {
  const { error } = await supabase.from('user_follows').insert({ follower_id: followerId, followed_id: followedId })
  if (error) throw error
}

export async function unfollow(followerId, followedId) {
  const { error } = await supabase
    .from('user_follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('followed_id', followedId)
  if (error) throw error
}

export async function fetchFollowerCount(userId) {
  const { count, error } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('followed_id', userId)
  if (error) throw error
  return count ?? 0
}

export async function fetchFollowingCount(userId) {
  const { count, error } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)
  if (error) throw error
  return count ?? 0
}

/** For "Follow / Following / Follows You / Mutual" states (Part 3 S15). */
export async function fetchFollowRelationship(myId, otherId) {
  if (!myId) return { iFollow: false, followsMe: false }
  const [{ data: a }, { data: b }] = await Promise.all([
    supabase.from('user_follows').select('follower_id').eq('follower_id', myId).eq('followed_id', otherId).maybeSingle(),
    supabase.from('user_follows').select('follower_id').eq('follower_id', otherId).eq('followed_id', myId).maybeSingle(),
  ])
  return { iFollow: !!a, followsMe: !!b }
}