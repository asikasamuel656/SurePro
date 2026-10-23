import { supabase } from '@/lib/supabase'
import { distanceKm } from '@/utils/distance'

const PROVIDER_JOB_SELECT = `
  id,
  customer_id,
  accepted_professional_id,
  category_id,
  title,
  description,
  address,
  latitude,
  longitude,
  budget_min,
  budget_max,
  requested_date,
  requested_time,
  request_type,
  target_professional_id,
  status,
  created_at,
  updated_at,

  category:categories (
    id,
    name,
    icon
  ),

  customer:profiles!jobs_customer_id_fkey (
    id,
    full_name,
    avatar_url,
    phone
  ),

  professional:professionals!jobs_accepted_professional_id_fkey (
    id,
    rating,
    completed_jobs,
    headline,
    profile:profiles!professionals_id_fkey (
      id,
      full_name,
      avatar_url,
      phone
    )
  ),

  target_professional:professionals!jobs_target_professional_id_fkey (
    id,
    rating,
    completed_jobs,
    headline,
    profile:profiles!professionals_id_fkey (
      id,
      full_name,
      avatar_url,
      phone
    )
  )
`

function normalizeJob(job, coords) {
  const distance =
    coords &&
    job.latitude != null &&
    job.longitude != null
      ? distanceKm(coords, {
          latitude: Number(job.latitude),
          longitude: Number(job.longitude),
        })
      : null

  return {
    ...job,
    distanceKm: distance,
    categoryName: job.category?.name ?? 'Service',
    customerName: job.customer?.full_name ?? 'Customer',
    customerAvatar: job.customer?.avatar_url ?? null,
  }
}

export async function fetchProviderOpenJobs({
  coords = null,
  categoryId = null,
  searchTerm = '',
  limit = 50,
} = {}) {
  let query = supabase
    .from('jobs')
    .select(PROVIDER_JOB_SELECT)
    .eq('status', 'open')
    .eq('request_type', 'marketplace')
    .is('accepted_professional_id', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch provider open jobs:', error)
    throw error
  }

  let jobs = (data ?? []).map((job) => normalizeJob(job, coords))

  const normalizedSearch = searchTerm.trim().toLowerCase()

  if (normalizedSearch) {
    jobs = jobs.filter((job) => {
      const searchable = [
        job.title,
        job.description,
        job.address,
        job.categoryName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(normalizedSearch)
    })
  }

  if (coords) {
    jobs.sort((a, b) => {
      if (a.distanceKm == null) return 1
      if (b.distanceKm == null) return -1
      return a.distanceKm - b.distanceKm
    })
  }

  return jobs
}

export async function fetchProviderJob(jobId) {
  if (!jobId) return null

  const { data, error } = await supabase
    .from('jobs')
    .select(PROVIDER_JOB_SELECT)
    .eq('id', jobId)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch provider job:', error)
    throw error
  }

  return data ? normalizeJob(data, null) : null
}

export async function fetchProviderDirectRequests(professionalId) {
  if (!professionalId) return []

  const { data, error } = await supabase
    .from('jobs')
    .select(PROVIDER_JOB_SELECT)
    .eq('request_type', 'direct')
    .eq('target_professional_id', professionalId)
    .in('status', ['open', 'quoted', 'accepted'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch direct requests:', error)
    throw error
  }

  return (data ?? []).map((job) => normalizeJob(job, null))
}

export async function fetchProviderMyJobs(professionalId) {
  if (!professionalId) return []

  const { data, error } = await supabase
    .from('jobs')
    .select(PROVIDER_JOB_SELECT)
    .eq('accepted_professional_id', professionalId)
    .in('status', [
      'accepted',
      'preparing',
      'on_the_way',
      'arrived',
      'in_progress',
    ])
    .order('requested_date', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch provider jobs:', error)
    throw error
  }

  return (data ?? []).map((job) => normalizeJob(job, null))
}

export async function fetchProviderCompletedJobs(professionalId) {
  if (!professionalId) return []

  const { data, error } = await supabase
    .from('jobs')
    .select(PROVIDER_JOB_SELECT)
    .eq('accepted_professional_id', professionalId)
    .eq('status', 'completed')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch completed jobs:', error)
    throw error
  }

  return (data ?? []).map((job) => normalizeJob(job, null))
}

export async function updateProviderJobStatus({
  jobId,
  professionalId,
  status,
}) {
  if (!jobId || !professionalId || !status) {
    throw new Error('Missing job status information.')
  }

  const allowedStatuses = [
    'preparing',
    'on_the_way',
    'arrived',
    'in_progress',
    'completed',
  ]

  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid provider job status.')
  }

  const { data, error } = await supabase
    .from('jobs')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('accepted_professional_id', professionalId)
    .select(PROVIDER_JOB_SELECT)
    .single()

  if (error) {
    console.error('Failed to update job status:', error)
    throw error
  }

  return normalizeJob(data, null)
}