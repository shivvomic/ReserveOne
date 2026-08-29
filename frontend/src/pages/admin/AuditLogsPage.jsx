import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ScrollText } from 'lucide-react';
import { fetchAuditLogs } from '../../services/auditLogService';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';

const ACTIONS = ['APPROVE', 'REJECT', 'MODIFY'];

const ACTION_COLOR_MAP = {
  APPROVE: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20',
  REJECT: 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20',
  MODIFY: 'bg-accent/10 text-accent ring-1 ring-inset ring-accent/20',
};

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString();
}

function ActionBadge({ action }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ACTION_COLOR_MAP[action] || 'bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20'
      }`}
    >
      {action}
    </span>
  );
}

function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadLogs = useCallback(
    async (pageToLoad, append) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const data = await fetchAuditLogs({ action: actionFilter, page: pageToLoad });
        setTotalPages(data.totalPages);
        setPage(data.page);
        setLogs((prev) => (append ? [...prev, ...data.logs] : data.logs));
      } catch (error) {
        console.error(error);
        toast.error('Could not load audit logs.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [actionFilter]
  );

  useEffect(() => {
    async function fetchInitialLogs() {
      await loadLogs(1, false);
    }
    fetchInitialLogs();
  }, [loadLogs]);

  function handleLoadMore() {
    loadLogs(page + 1, true);
  }

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Recent administrative actions on bookings." />

      <div className="mt-4">
        <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="w-44">
          <option value="">All actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </Select>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-card" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No administrative actions yet"
            description="Approvals, rejections, and modifications will show up here."
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-card border border-border bg-surface md:block">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-surface-hover/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted">When</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Admin</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Action</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Booking</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="transition-colors hover:bg-surface-hover/40">
                      <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDateTime(log.created_at)}</td>
                      <td className="px-4 py-3 text-foreground">{log.admin_name || 'Unknown'}</td>
                      <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
                      <td className="px-4 py-3 text-muted">#{log.booking_id ?? '—'}</td>
                      <td className="px-4 py-3 text-muted">{log.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {logs.map((log) => (
                <div key={log.id} className="rounded-card border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{log.admin_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</p>
                    </div>
                    <ActionBadge action={log.action} />
                  </div>
                  <p className="mt-2 text-sm text-muted">Booking #{log.booking_id ?? '—'}</p>
                  {log.details && <p className="mt-1 text-sm text-muted-foreground">{log.details}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && logs.length > 0 && page < totalPages && (
          <Button variant="secondary" onClick={handleLoadMore} loading={loadingMore} className="mt-4 w-full">
            Load more
          </Button>
        )}
      </div>
    </div>
  );
}

export default AuditLogsPage;