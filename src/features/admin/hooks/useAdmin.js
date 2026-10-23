import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminStats,
  fetchUsers,
  fetchProfessionalsForAdmin,
  updateVerificationStatus,
  fetchAllJobs,
  fetchReports,
  updateReportStatus,
  deletePost,
} from '../services/adminApi'

export function useAdminStats() {
  return useQuery({ queryKey: ['admin', 'stats'], queryFn: fetchAdminStats })
}

export function useAdminUsers(search) {
  return useQuery({ queryKey: ['admin', 'users', search ?? null], queryFn: () => fetchUsers({ search }) })
}

export function useVerificationQueue(verificationStatus) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['admin', 'professionals', verificationStatus ?? null],
    queryFn: () => fetchProfessionalsForAdmin({ verificationStatus }),
  })
  const mutation = useMutation({
    mutationFn: ({ professionalId, status }) => updateVerificationStatus(professionalId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'professionals'] }),
  })
  return { ...query, setVerification: mutation.mutate, isUpdating: mutation.isPending }
}

export function useAdminJobs(status) {
  return useQuery({ queryKey: ['admin', 'jobs', status ?? null], queryFn: () => fetchAllJobs({ status }) })
}

export function useAdminReports(status) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['admin', 'reports', status ?? null],
    queryFn: () => fetchReports({ status }),
  })
  const mutation = useMutation({
    mutationFn: ({ reportId, status: newStatus }) => updateReportStatus(reportId, newStatus),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  })
  return { ...query, setStatus: mutation.mutate, isUpdating: mutation.isPending }
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  })
}