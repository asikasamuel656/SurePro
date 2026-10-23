import { supabase } from '@/lib/supabase'

const QUOTE_SELECT = `
  id,
  job_id,
  professional_id,
  amount,
  message,
  proposed_date,
  proposed_time,
  status,
  created_at,
  updated_at,

  professional:professionals!quotes_professional_id_fkey (
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

export async function fetchJobQuotes(jobId) {
  if (!jobId) return []

  const { data, error } = await supabase
    .from('quotes')
    .select(QUOTE_SELECT)
    .eq('job_id', jobId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch job quotes:', error)
    throw error
  }

  return data ?? []
}

export async function fetchMyQuote(jobId, professionalId) {
  if (!jobId || !professionalId) return null

  const { data, error } = await supabase
    .from('quotes')
    .select(QUOTE_SELECT)
    .eq('job_id', jobId)
    .eq('professional_id', professionalId)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch my quote:', error)
    throw error
  }

  return data
}

export async function createQuote({
  jobId,
  professionalId,
  amount,
  message,
  proposedDate,
  proposedTime,
}) {
  if (!jobId) throw new Error('Job is required.')
  if (!professionalId) throw new Error('Professional is required.')
  if (!amount || Number(amount) <= 0) {
    throw new Error('Enter a valid quote amount.')
  }

  const payload = {
    job_id: jobId,
    professional_id: professionalId,
    amount: Number(amount),
    message: message?.trim() || null,
    proposed_date: proposedDate || null,
    proposed_time: proposedTime || null,
  }

  const { data, error } = await supabase
    .from('quotes')
    .insert(payload)
    .select(QUOTE_SELECT)
    .single()

  if (error) {
    console.error('Failed to create quote:', error)
    throw error
  }

  return data
}

export async function updateQuoteStatus(quoteId, status) {
  if (!quoteId) throw new Error('Quote is required.')

  const allowedStatuses = [
    'pending',
    'accepted',
    'rejected',
    'withdrawn',
  ]

  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid quote status.')
  }

  const { data, error } = await supabase
    .from('quotes')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId)
    .select(QUOTE_SELECT)
    .single()

  if (error) {
    console.error('Failed to update quote:', error)
    throw error
  }

  return data
}

export async function acceptQuote(quoteId) {
  return updateQuoteStatus(quoteId, 'accepted')
}

export async function rejectQuote(quoteId) {
  return updateQuoteStatus(quoteId, 'rejected')
}

export async function withdrawQuote(quoteId) {
  return updateQuoteStatus(quoteId, 'withdrawn')
}