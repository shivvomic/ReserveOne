import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';
import { fetchUsers } from '../../services/userService';
import { getInitials } from '../../utils/getInitials';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import Skeleton from '../../components/Skeleton';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString();
}

function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        role === 'ADMIN'
          ? 'bg-accent/10 text-accent ring-1 ring-inset ring-accent/20'
          : 'bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20'
      }`}
    >
      {role}
    </span>
  );
}

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(() => toast.error('Could not load users.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="User Management" subtitle="Registered students and admins." />

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-card" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-card border border-border bg-surface md:block">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-surface-hover/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted">User</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-surface-hover/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-hover text-xs font-semibold text-muted">
                            {getInitials(u.name)}
                          </span>
                          <span className="font-medium text-foreground">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{u.email}</td>
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-4 py-3 text-muted">{formatDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {users.map((u) => (
                <div key={u.id} className="rounded-card border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-hover text-xs font-semibold text-muted">
                        {getInitials(u.name)}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <RoleBadge role={u.role} />
                  </div>
                  <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                    Joined {formatDate(u.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserManagementPage;