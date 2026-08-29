import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

// onMenuClick is only ever passed by DashboardLayout — PublicLayout's
// pages have no sidebar, so the hamburger simply never renders there.
function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const logoDestination = user
    ? user.role === 'ADMIN'
      ? '/admin/dashboard'
      : '/student/dashboard'
    : '/';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="-ml-1.5 rounded-btn p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link to={logoDestination} className="text-base font-semibold tracking-tight text-foreground">
            Reserve<span className="text-accent">One</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden text-sm text-muted sm:inline">
                {user.name} <span className="text-muted-foreground">·</span> {user.role}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted transition-colors hover:text-foreground">
                Login
              </Link>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Sign up
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;