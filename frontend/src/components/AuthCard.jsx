function AuthCard({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6 py-16">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm">
        <div className="rounded-card border border-border bg-surface p-8 shadow-2xl shadow-black/40">
          {eyebrow && <p className="text-xs font-medium uppercase tracking-wider text-accent">{eyebrow}</p>}
          <h1 className="mt-2 text-2xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
      </div>
    </div>
  );
}

export default AuthCard;