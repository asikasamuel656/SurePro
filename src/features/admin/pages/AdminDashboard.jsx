import { Users, Wrench, Briefcase, Flag } from 'lucide-react'
import { AdminLayout } from '../components/AdminLayout'
import { StatCard } from '../components/StatCard'
import { useAdminStats } from '../hooks/useAdmin'

export function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats()

  return (
    <AdminLayout>
      <h2 className="mb-4 text-base font-bold text-ink">Overview</h2>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-card bg-surface" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total users" value={stats.userCount} icon={Users} />
          <StatCard label="Professionals" value={stats.proCount} icon={Wrench} />
          <StatCard label="Total jobs" value={stats.jobCount} icon={Briefcase} />
          <StatCard label="Open reports" value={stats.openReportCount} icon={Flag} />
        </div>
      )}
    </AdminLayout>
  )
}