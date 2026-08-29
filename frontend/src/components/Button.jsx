import { Loader2 } from 'lucide-react';

const VARIANT_CLASSES = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-surface text-foreground border border-border hover:border-border-hover hover:bg-surface-hover',
  ghost: 'text-muted hover:text-foreground hover:bg-surface',
  danger: 'bg-red-600 text-white hover:bg-red-500',
};

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

function Button({ variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-btn font-medium transition-all duration-150
                  active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50
                  ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export default Button;