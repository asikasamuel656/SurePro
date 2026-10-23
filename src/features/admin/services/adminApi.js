import { supabase } from '@/lib/supabase'

export async function fetchAdminStats() {
  const [{ count: userCount }, { count: proCount }, { count: jobCount }, { count: openReportCount }] =
    await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('professionals').select('*', { count: 'exact', head: true }),
      supabase.from('jobs').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    ])
  return {
    userCount: userCount ?? 0,
    proCount: proCount ?? 0,
    jobCount: jobCount ?? 0,
    openReportCount: openReportCount ?? 0,
  }
}

export async function fetchUsers({ search } = {}) {
  let query = supabase
    .from('profiles')
    .select('id, full_name, phone, account_type, is_admin, created_at')
    .order('created_at', { ascending: false })
    .limit(50)
  if (search) query = query.ilike('full_name', `%${search}%`)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchProfessionalsForAdmin({ verificationStatus } = {}) {
  let query = supabase
    .from('professionals')
    .select('id, headline, verification_status, rating, completed_jobs, is_available, profile:profiles ( full_name, avatar_url )')
    .order('created_at', { ascending: false })
    .limit(50)
  if (verificationStatus) query = query.eq('verification_status', verificationStatus)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function updateVerificationStatus(professionalId, status) {
  const { error } = await supabase
    .from('professionals')
    .update({ verification_status: status })
    .eq('id', professionalId)
  if (error) throw error
}

export async function fetchAllJobs({ status } = {}) {
  let query = supabase
    .from('jobs')
    .select('id, title, status, created_at, customer:profiles!jobs_customer_id_fkey ( full_name )')
    .order('created_at', { ascending: false })
    .limit(50)
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchReports({ status } = {}) {
  let query = supabase
    .from('reports')
    .select('*, reporter:profiles!reports_reporter_id_fkey ( full_name )')
    .order('created_at', { ascending: false })
    .limit(50)
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function updateReportStatus(reportId, status) {
  const { error } = await supabase.from('reports').update({ status }).eq('id', reportId)
  if (error) throw error
}

export async function deletePost(postId) {
  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) throw error
}