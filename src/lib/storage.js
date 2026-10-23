import { supabase } from '@/lib/supabase'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB, matches the bucket's server-side limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Uploads a single image file to the given bucket under `${folder}/...`.
 * Client-side validation here is a UX nicety -- the real enforcement is
 * the bucket's file_size_limit/allowed_mime_types and the folder-owner RLS
 * policy set up in migration 0012_storage.sql.
 */
export async function uploadImage({ bucket, folder, file }) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Please choose a JPEG, PNG, or WEBP image.')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Images must be under 5MB.')
  }

  const ext = file.name.split('.').pop()
  const path = `${folder}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}