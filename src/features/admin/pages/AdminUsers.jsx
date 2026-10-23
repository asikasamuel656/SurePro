import { useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { useAdminUsers } from '../hooks/useAdmin'

export function AdminUsers() {
  const [search, setSearch] = useState('')
  const { data: users = [], isLoading } = useAdminUsers(search)

  return (
    <AdminLayout>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">Users</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name"
          className="rounded-control border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-control bg-surface" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-bg text-left text-xs font-semibold text-muted">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-3 py-2 font-medium text-ink">
                    {u.full_name ?? '—'} {u.is_admin && <span className="ml-1 text-xs text-primary">(admin)</span>}
                  </td>
                  <td className="px-3 py-2 capitalize text-ink-soft">{u.account_type}</td>
                  <td className="px-3 py-2 text-ink-soft">{u.phone ?? '—'}</td>
                  <td className="px-3 py-2 text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}