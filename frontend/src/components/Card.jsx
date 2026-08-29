function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-card border border-border bg-surface p-5 transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;