import { Loader2 } from 'lucide-react';

function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className="h-5 w-5 animate-spin text-accent" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export default LoadingSpinner;