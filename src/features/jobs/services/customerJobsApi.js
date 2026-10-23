import { supabase } from '@/lib/supabase'

const CUSTOMER_JOB_SELECT = `
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

export async function fetchCustomerJobs(customerId) {
  if (!customerId) return []

  const { data, error } = await supabase
    .from('jobs')
    .select(CUSTOMER_JOB_SELECT)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch customer jobs:', error)
    throw error
  }

  return data ?? []
}

export async function fetchCustomerJob(jobId, customerId) {
  if (!jobId || !customerId) return null

  const { data, error } = await supabase
    .from('jobs')
    .select(CUSTOMER_JOB_SELECT)
    .eq('id', jobId)
    .eq('customer_id', customerId)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch customer job:', error)
    throw error
  }

  return data
}

export async function cancelCustomerJob(jobId, customerId) {
  if (!jobId || !customerId) {
    throw new Error('Job information is missing.')
  }

  const { data, error } = await supabase
    .from('jobs')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('customer_id', customerId)
    .in('status', ['open', 'quoted', 'accepted'])
    .select(CUSTOMER_JOB_SELECT)
    .single()

  if (error) {
    console.error('Failed to cancel job:', error)
    throw error
  }

  return data
}

export async function acceptProfessionalForJob({
  jobId,
  customerId,
  professionalId,
}) {
  if (!jobId || !customerId || !professionalId) {
    throw new Error('Missing job information.')
  }

  const { data, error } = await supabase
    .from('jobs')
    .update({
      accepted_professional_id: professionalId,
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('customer_id', customerId)
    .eq('status', 'open')
    .select(CUSTOMER_JOB_SELECT)
    .single()

  if (error) {
    console.error('Failed to accept professional:', error)
    throw error
  }

  return data
}