import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfessionalProfile } from '@/features/professionals/services/professionalApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useToggleAvailability() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isAvailable) => updateProfessionalProfile(user.id, { is_available: isAvailable }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownProfessional', user?.id] })
    },
  })
}