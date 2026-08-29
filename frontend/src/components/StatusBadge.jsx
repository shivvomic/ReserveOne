const COLOR_MAP = {
  AVAILABLE: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20',
  UNAVAILABLE: 'bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20',
  MAINTENANCE: 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20',
  PENDING: 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20',
  APPROVED: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20',
  CANCELLED: 'bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20',
};

function StatusBadge({ status }) {
  const classes = COLOR_MAP[status] || 'bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {status}
    </span>
  );
}

export default StatusBadge;