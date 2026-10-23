import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toggleSaveProfessional } from '../services/savedApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

async function fetchIsSaved(professionalId, userId) {
  if (!userId) return false
  const { data, error } = await supabase
    .from('saved_professionals')
    .select('professional_id')
    .eq('professional_id', professionalId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return !!data
}

export function useSaveProfessional(professionalId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['isSavedProfessional', professionalId, user?.id],
    queryFn: () => fetchIsSaved(professionalId, user.id),
    enabled: !!professionalId && !!user?.id,
  })

  const mutation = useMutation({
    mutationFn: () => toggleSaveProfessional(professionalId, user.id, !!query.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isSavedProfessional', professionalId, user?.id] })
      queryClient.invalidateQueries({ queryKey: ['savedProfessionals', user?.id] })
    },
  })

  return { isSaved: !!query.data, toggle: mutation.mutate, isToggling: mutation.isPending }
}