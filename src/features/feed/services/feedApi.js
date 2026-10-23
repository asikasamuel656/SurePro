import { supabase } from '@/lib/supabase'

const FEED_SELECT = `
  id,
  caption,
  post_type,
  location,
  created_at,
  updated_at,

  professional:professionals (
    id,
    headline,
    rate_min,
    rate_max,
    latitude,
    longitude,
    rating,
    completed_jobs,
    is_available,
    category_id,
    created_at,
    updated_at,

    profile:profiles!professionals_id_fkey (
      id,
      full_name,
      avatar_url,
      username
    )
  ),

  media:post_media (
    id,
    media_url,
    media_type,
    is_before,
    sort_order
  ),

  reactions (
    user_id
  ),

  comments (
    id
  )
`

function handleSupabaseError(action, error) {
  if (!error) return

  console.error(`❌ ${action} failed`, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  })

  throw error
}

function normalizePost(post) {
  return {
    ...post,

    media: [...(post.media ?? [])].sort(
      (a, b) =>
        (a.sort_order ?? 0) -
        (b.sort_order ?? 0)
    ),

    likeCount:
      post.reactions?.length ?? 0,

    commentCount:
      post.comments?.length ?? 0,

    saveCount:
      post.saved_posts?.length ?? 0,
  }
}

export async function fetchFeed({
  professionalId,
  searchTerm,
} = {}) {
  console.log('🔎 Fetching SurePro feed...', {
    professionalId,
    searchTerm,
  })

  let query = supabase
    .from('posts')
    .select(FEED_SELECT)
    .order('created_at', {
      ascending: false,
    })

  if (professionalId) {
    query = query.eq(
      'professional_id',
      professionalId
    )
  }

  if (searchTerm?.trim()) {
    query = query.ilike(
      'caption',
      `%${searchTerm.trim()}%`
    )
  }

  const {
    data,
    error,
  } = await query

  handleSupabaseError(
    'Fetching feed',
    error
  )

  const posts = data ?? []

  if (posts.length === 0) {
    return []
  }

  /*
   * Fetch all saves belonging to the posts
   * returned by this feed request.
   *
   * This is ONE query rather than one query
   * per post.
   */
  const postIds = posts.map(
    (post) => post.id
  )

  const {
    data: savedPosts,
    error: savedPostsError,
  } = await supabase
    .from('saved_posts')
    .select('post_id')
    .in('post_id', postIds)

  handleSupabaseError(
    'Fetching post save counts',
    savedPostsError
  )

  const saveCounts = {}

  for (const savedPost of savedPosts ?? []) {
    saveCounts[savedPost.post_id] =
      (saveCounts[savedPost.post_id] ?? 0) + 1
  }

  return posts.map((post) =>
    normalizePost({
      ...post,

      saveCount:
        saveCounts[post.id] ?? 0,
    })
  )
}

export async function fetchPost(postId) {
  console.log('🔎 Fetching post:', postId)

  const { data, error } = await supabase
    .from('posts')
    .select(FEED_SELECT)
    .eq('id', postId)
    .single()

  handleSupabaseError('Fetching post', error)

  return normalizePost(data)
}

export async function createPost({
  professionalId,
  caption,
  postType,
  media,
}) {
  console.log('📝 Creating post...', {
    professionalId,
    postType,
  })

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      professional_id: professionalId,
      caption,
      post_type: postType,
    })
    .select()
    .single()

  handleSupabaseError('Creating post', error)

  if (media?.length) {
    const rows = media.map((item, index) => ({
      post_id: post.id,
      media_url: item.url,
      media_type: 'image',
      is_before: !!item.isBefore,
      sort_order: index,
    }))

    const {
      error: mediaError,
    } = await supabase
      .from('post_media')
      .insert(rows)

    handleSupabaseError(
      'Creating post media',
      mediaError
    )
  }

  console.log('✅ Post created:', post)

  return post
}

export async function toggleReaction(
  postId,
  userId,
  hasReacted
) {
  if (hasReacted) {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    handleSupabaseError(
      'Removing reaction',
      error
    )
  } else {
    const { error } = await supabase
      .from('reactions')
      .insert({
        post_id: postId,
        user_id: userId,
      })

    handleSupabaseError(
      'Adding reaction',
      error
    )
  }
}

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      user:profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', {
      ascending: true,
    })

  handleSupabaseError(
    'Fetching comments',
    error
  )

  return data ?? []
}

export async function addComment(
  postId,
  userId,
  content
) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content,
    })
    .select(`
      id,
      content,
      created_at,
      user:profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .single()

  handleSupabaseError(
    'Adding comment',
    error
  )

  return data
}

export async function fetchSavedPostIds(userId) {
  const { data, error } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('user_id', userId)

  handleSupabaseError(
    'Fetching saved posts',
    error
  )

  return (data ?? []).map(
    (row) => row.post_id
  )
}

export async function toggleSave(
  postId,
  userId,
  isSaved
) {
  if (isSaved) {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    handleSupabaseError(
      'Removing saved post',
      error
    )
  } else {
    const { error } = await supabase
      .from('saved_posts')
      .insert({
        post_id: postId,
        user_id: userId,
      })

    handleSupabaseError(
      'Saving post',
      error
    )
  }
}