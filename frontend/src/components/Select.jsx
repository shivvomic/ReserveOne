import { ChevronDown } from 'lucide-react';

// className controls the wrapper's width (e.g. "w-48"); the select itself
// always fills that wrapper. Native appearance is stripped in favor of the
// custom chevron so it matches .input-field styling exactly.
function Select({ className = '', selectClassName = '', children, ...props }) {
  return (
    <div className={`relative ${className}`}>
      <select className={`input-field w-full appearance-none pr-9 ${selectClassName}`} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export default Select;