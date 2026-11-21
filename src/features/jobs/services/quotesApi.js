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

export async function editQuote({
  quoteId,
  amount,
  message,
  proposedDate,
  proposedTime,
}) {
  if (!quoteId) throw new Error('Quote is required.')

  const numericAmount = Number(amount)

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Enter a valid quote amount.')
  }

  const { error } = await supabase.rpc('edit_job_quote', {
    p_quote_id: quoteId,
    p_amount: numericAmount,
    p_message: message?.trim() || null,
    p_proposed_date: proposedDate || null,
    p_proposed_time: proposedTime || null,
  })

  if (error) {
    console.error('Failed to edit quote:', error)
    throw error
  }

  return fetchQuoteById(quoteId)
}

export async function withdrawQuote(quoteId) {
  if (!quoteId) throw new Error('Quote is required.')

  const { error } = await supabase.rpc('withdraw_job_quote', {
    p_quote_id: quoteId,
  })

  if (error) {
    console.error('Failed to withdraw quote:', error)
    throw error
  }

  return fetchQuoteById(quoteId)
}

async function fetchQuoteById(quoteId) {
  const { data, error } = await supabase
    .from('quotes')
    .select(QUOTE_SELECT)
    .eq('id', quoteId)
    .single()

  if (error) {
    console.error('Failed to fetch updated quote:', error)
    throw error
  }

  return data
}