import { Inbox } from 'lucide-react';

function EmptyState({ title, description, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface/40 py-14 text-center">
      <Icon className="h-6 w-6 text-muted-foreground" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
    </div>
  );
}

export default EmptyState;