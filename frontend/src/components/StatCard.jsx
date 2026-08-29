import Card from './Card';

const TONE_CLASSES = {
  default: 'text-foreground',
  accent: 'text-accent',
  warning: 'text-amber-400',
  success: 'text-emerald-400',
};

function StatCard({ label, value, icon: Icon, tone = 'default' }) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className={`mt-1.5 text-2xl font-semibold ${TONE_CLASSES[tone]}`}>{value}</p>
      </div>
      {Icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-surface-hover text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      )}
    </Card>
  );
}

export default StatCard;