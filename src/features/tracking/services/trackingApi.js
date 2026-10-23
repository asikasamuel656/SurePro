import { supabase } from '@/lib/supabase'

export async function upsertLocation({ jobId, professionalId, latitude, longitude, heading }) {
  const { error } = await supabase
    .from('job_tracking')
    .upsert(
      { job_id: jobId, professional_id: professionalId, latitude, longitude, heading, updated_at: new Date().toISOString() },
      { onConflict: 'job_id' }
    )
  if (error) throw error
}

export async function fetchLocation(jobId) {
  const { data, error } = await supabase
    .from('job_tracking')
    .select('*')
    .eq('job_id', jobId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function stopSharingLocation(jobId) {
  const { error } = await supabase.from('job_tracking').delete().eq('job_id', jobId)
  if (error) throw error
}

export function subscribeToLocation(jobId, onChange) {
  const channel = supabase
    .channel(`tracking:${jobId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'job_tracking', filter: `job_id=eq.${jobId}` },
      (payload) => onChange(payload.eventType === 'DELETE' ? null : payload.new)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}