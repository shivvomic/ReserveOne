import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

function SidebarLinks({ links, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-2.5 rounded-btn px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-surface text-foreground' : 'text-muted hover:bg-surface hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {Icon && (
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-muted'
                    }`}
                  />
                )}
                {link.label}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

// Renders twice — a static column on desktop (lg+, no backdrop, no
// animation needed) and an animated off-canvas drawer below lg, controlled
// by `open`/`onClose`. Two renders rather than one repositioned element
// because the two behave genuinely differently, not just look different.
function Sidebar({ links, open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-border bg-background px-3 py-6 lg:block">
        <SidebarLinks links={links} />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-background px-3 py-6 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="mb-4 flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-foreground">Menu</span>
                <button
                  onClick={onClose}
                  className="rounded-btn p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarLinks links={links} onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;