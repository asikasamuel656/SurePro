import { supabase } from '@/lib/supabase'

const JOB_SELECT = `
  id,
  customer_id,
  title,
  description,
  address,
  latitude,
  longitude,
  category_id,
  budget_min,
  budget_max,
  status,
  request_type,
  target_professional_id,
  requested_date,
  requested_time,
  accepted_professional_id,
  accepted_quote_id,
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

  accepted_professional:professionals!jobs_accepted_professional_id_fkey (
    id,
    rating,
    completed_jobs,

    profile:profiles!professionals_id_fkey (
      id,
      full_name,
      avatar_url,
      phone
    )
  )
`

function throwSupabaseError(action, error) {
  if (error) {
    console.error(`❌ ${action} failed:`, {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })

    throw error
  }
}

/* -------------------------------------------------------
   CREATE JOB
------------------------------------------------------- */

export async function createJob({
  customerId,
  categoryId,
  title,
  description,
  address,
  latitude,
  longitude,
  budgetMin,
  budgetMax,
}) {
  console.log('📝 Creating job...', {
    customerId,
    categoryId,
    title,
    address,
  })

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      customer_id: customerId,
      category_id: categoryId,
      title: title.trim(),
      description: description.trim(),
      address: address.trim(),
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      budget_min: budgetMin
        ? Number(budgetMin)
        : null,
      budget_max: budgetMax
        ? Number(budgetMax)
        : null,
    })
    .select()
    .single()

  throwSupabaseError('Creating job', error)

  console.log('✅ Job created:', data)

  return data
}

/* -------------------------------------------------------
   CUSTOMER JOBS
------------------------------------------------------- */

export async function fetchMyJobs(customerId) {
  console.log(
    '🔎 Fetching customer jobs:',
    customerId
  )

  const { data, error } = await supabase
    .from('jobs')
    .select(JOB_SELECT)
    .eq('customer_id', customerId)
    .order('created_at', {
      ascending: false,
    })

  throwSupabaseError(
    'Fetching customer jobs',
    error
  )

  return data ?? []
}

/* -------------------------------------------------------
   PROFESSIONAL ASSIGNED JOBS
------------------------------------------------------- */

export async function fetchAssignedJobs(
  professionalId
) {
  console.log(
    '🔎 Fetching professional jobs:',
    professionalId
  )

  const { data, error } = await supabase
    .from('jobs')
    .select(JOB_SELECT)
    .eq(
      'accepted_professional_id',
      professionalId
    )
    .order('created_at', {
      ascending: false,
    })

  throwSupabaseError(
    'Fetching professional jobs',
    error
  )

  return data ?? []
}

/* -------------------------------------------------------
   OPEN JOB REQUESTS
------------------------------------------------------- */

export async function fetchJobRequests({
  categoryId,
} = {}) {
  console.log('🔎 Fetching job requests:', {
    categoryId,
  })

  let query = supabase
    .from('jobs')
    .select(JOB_SELECT)
    .in('status', ['open', 'quoted'])
    .order('created_at', {
      ascending: false,
    })

  if (categoryId) {
    query = query.eq(
      'category_id',
      categoryId
    )
  }

  const { data, error } = await query

  throwSupabaseError(
    'Fetching job requests',
    error
  )

  return data ?? []
}

/* -------------------------------------------------------
   SINGLE JOB
------------------------------------------------------- */

export async function fetchJob(jobId) {
  console.log('🔎 Fetching job:', jobId)

  const { data, error } = await supabase
    .from('jobs')
    .select(JOB_SELECT)
    .eq('id', jobId)
    .single()

  throwSupabaseError(
    'Fetching job',
    error
  )

  return data
}

/* -------------------------------------------------------
   JOB STATUS EVENTS
------------------------------------------------------- */

export async function fetchJobStatusEvents(jobId) {
  return []
}

/* -------------------------------------------------------
   QUOTES FOR A JOB
------------------------------------------------------- */

export async function fetchQuotesForJob(jobId) {
  console.log(
    '🔎 Fetching quotes for job:',
    jobId
  )

  const { data, error } = await supabase
    .from('quotes')
    .select(`
      id,
      amount,
      message,
      status,
      proposed_date,
      proposed_time,
      created_at,
      updated_at,

      professional:professionals (
        id,
        rating,
        completed_jobs,

        profile:profiles!professionals_id_fkey (
          id,
          full_name,
          avatar_url,
          phone
        )
      )
    `)
    .eq('job_id', jobId)
    .order('created_at', {
      ascending: false,
    })

  throwSupabaseError(
    'Fetching quotes',
    error
  )

  return data ?? []
}

/* -------------------------------------------------------
   SUBMIT QUOTE
------------------------------------------------------- */

export async function submitQuote({
  jobId,
  professionalId,
  price,
  message,
  proposedDate,
  proposedTime,
}) {
  console.log('💰 Submitting quote:', {
    jobId,
    professionalId,
    price,
  })

  /*
   * Get the customer who owns the job.
   */
  const {
    data: job,
    error: jobError,
  } = await supabase
    .from('jobs')
    .select(
      'id, customer_id, title, status'
    )
    .eq('id', jobId)
    .single()

  if (jobError) {
    console.error(
      '❌ Could not fetch job:',
      jobError
    )

    throw jobError
  }

  /*
   * Prevent quotes on jobs that have
   * already been accepted/cancelled.
   */
  if (!['open', 'quoted'].includes(job.status)) {
    throw new Error(
      'This job is no longer accepting quotes.'
    )
  }

  /*
   * Create the quote.
   */
  const {
    data: quote,
    error: quoteError,
  } = await supabase
    .from('quotes')
    .insert({
      job_id: jobId,
      professional_id: professionalId,
      amount: Number(price),
      message:
        message?.trim() || null,
      proposed_date:
        proposedDate || null,
      proposed_time:
        proposedTime || null,
    })
    .select()
    .single()

  if (quoteError) {
    console.error(
      '❌ Quote creation failed:',
      quoteError
    )

    throw quoteError
  }

  console.log(
    '✅ Quote created:',
    quote
  )

  /*
   * Move an open job into quote review.
   */
  if (job.status === 'open') {
    const {
      error: statusError,
    } = await supabase
      .from('jobs')
      .update({
        status: 'quoted',
      })
      .eq('id', jobId)
      .eq('status', 'open')

    if (statusError) {
      console.error(
        '⚠️ Failed to change job status to quoted:',
        statusError
      )
    }
  }

  /*
   * Notify customer.
   */
  const {
    data: notification,
    error: notificationError,
  } = await supabase.rpc(
    'create_notification',
    {
      p_user_id: job.customer_id,
      p_type: 'new_quote',
      p_title: 'New quote received',
      p_message: `A professional submitted a ₦${Number(
        price
      ).toLocaleString(
        'en-NG'
      )} quote for "${job.title}".`,
      p_data: {
        job_id: jobId,
        quote_id: quote.id,
      },
    }
  )

  if (notificationError) {
    console.error(
      '⚠️ Notification creation failed:',
      notificationError
    )
  } else {
    console.log(
      '🔔 Quote notification created:',
      notification
    )
  }

  return quote
}

/* -------------------------------------------------------
   ACCEPT QUOTE
------------------------------------------------------- */

export async function acceptQuote({
  jobId,
  quoteId,
  professionalId,
}) {
  console.log('✅ Accepting quote:', {
    jobId,
    quoteId,
    professionalId,
  })

  /*
   * IMPORTANT:
   *
   * The actual acceptance happens inside
   * accept_job_quote().
   *
   * This performs the workflow atomically:
   *
   * selected quote -> accepted
   * other pending quotes -> rejected
   * job -> accepted
   * professional -> assigned
   */
  const {
    data,
    error,
  } = await supabase.rpc(
    'accept_job_quote',
    {
      p_job_id: jobId,
      p_quote_id: quoteId,
      p_professional_id:
        professionalId,
    }
  )

  if (error) {
    console.error(
      '❌ Accept quote failed:',
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    )

    throw error
  }

  console.log(
    '🎉 Quote accepted successfully:',
    data
  )

  /*
   * Refreshing the quote/job data is normally
   * handled by the React Query mutation.
   */
  return data
}

/* -------------------------------------------------------
   REJECT QUOTE
------------------------------------------------------- */

export async function rejectQuote({
  jobId,
  quoteId,
}) {
  console.log('❌ Rejecting quote:', {
    jobId,
    quoteId,
  })

  /*
   * Get quote + professional profile + job.
   *
   * We need the profile ID for notifications.
   */
  const {
    data: quote,
    error: quoteFetchError,
  } = await supabase
    .from('quotes')
    .select(`
      id,
      professional_id,
      job_id,
      status,

      professional:professionals (
        id,

        profile:profiles!professionals_id_fkey (
          id,
          full_name
        )
      ),

      job:jobs (
        id,
        title,
        customer_id,
        status
      )
    `)
    .eq('id', quoteId)
    .eq('job_id', jobId)
    .single()

  if (quoteFetchError) {
    console.error(
      '❌ Could not fetch quote:',
      quoteFetchError
    )

    throw quoteFetchError
  }

  if (quote.status !== 'pending') {
    throw new Error(
      'This quote has already been processed.'
    )
  }

  /*
   * Reject the quote.
   *
   * Database status remains "rejected".
   * QuoteCard displays this as "Cancelled".
   */
  const {
    error: rejectError,
  } = await supabase
    .from('quotes')
    .update({
      status: 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId)
    .eq('job_id', jobId)
    .eq('status', 'pending')

  throwSupabaseError(
    'Rejecting quote',
    rejectError
  )

  /*
   * Notify the professional.
   *
   * notifications.user_id should be the profile/auth
   * user ID, not blindly the professionals table ID.
   */
  const professionalUserId =
    quote.professional?.profile?.id

  if (professionalUserId) {
    const {
      error: notificationError,
    } = await supabase.rpc(
      'create_notification',
      {
        p_user_id:
          professionalUserId,

        p_type:
          'quote_rejected',

        p_title:
          'Quote cancelled',

        p_message: `Your quote for "${
          quote.job?.title ??
          'this job'
        }" was cancelled because another professional was selected or the customer rejected this quote.`,

        p_data: {
          job_id: jobId,
          quote_id: quoteId,
        },
      }
    )

    if (notificationError) {
      console.error(
        '⚠️ Rejection notification failed:',
        notificationError
      )
    }
  }

  console.log(
    '✅ Quote rejected/cancelled'
  )

  return {
    ...quote,
    status: 'rejected',
  }
}

/* -------------------------------------------------------
   UPDATE JOB STATUS
------------------------------------------------------- */

export async function updateJobStatus(
  jobId,
  status
) {
  console.log('🔄 Updating job status:', {
    jobId,
    status,
  })

  const {
    data,
    error,
  } = await supabase.rpc(
    'update_job_status',
    {
      p_job_id: jobId,
      p_status: status,
    }
  )

  if (error) {
    console.error(
      '❌ Job status update failed:',
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    )

    throw error
  }

  console.log(
    '✅ Job status updated:',
    data
  )

  return data
}
/* -------------------------------------------------------
   CANCEL JOB
------------------------------------------------------- */

export async function cancelJob(jobId) {
  console.log(
    '❌ Cancelling job:',
    jobId
  )

  const {
    data: job,
    error: fetchError,
  } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      customer_id,
      accepted_professional_id,

      accepted_professional:professionals!jobs_accepted_professional_id_fkey (
        id,

        profile:profiles!professionals_id_fkey (
          id,
          full_name
        )
      )
    `)
    .eq('id', jobId)
    .single()

  if (fetchError) {
    throw fetchError
  }

  const {
    error,
  } = await supabase
    .from('jobs')
    .update({
      status: 'cancelled',
    })
    .eq('id', jobId)

  throwSupabaseError(
    'Cancelling job',
    error
  )

  /*
   * Notify assigned professional.
   *
   * Use the professional's profile ID as the
   * notification recipient.
   */
  const professionalUserId =
    job.accepted_professional
      ?.profile?.id

  if (professionalUserId) {
    const {
      error: notificationError,
    } = await supabase.rpc(
      'create_notification',
      {
        p_user_id:
          professionalUserId,

        p_type:
          'job_cancelled',

        p_title:
          'Job cancelled',

        p_message: `The job "${job.title}" was cancelled.`,

        p_data: {
          job_id: jobId,
        },
      }
    )

    if (notificationError) {
      console.error(
        '⚠️ Cancellation notification failed:',
        notificationError
      )
    }
  }

  console.log(
    '✅ Job cancelled'
  )
}

/* -------------------------------------------------------
   JOB PHOTOS
------------------------------------------------------- */

export async function fetchJobPhotos(jobId) {
  return []
}

export async function addJobPhoto({
  jobId,
  uploadedBy,
  photoUrl,
  stage,
}) {
  throw new Error(
    'Job photos are not available yet.'
  )
}