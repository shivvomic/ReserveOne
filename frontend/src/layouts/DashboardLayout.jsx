import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PageTransition from '../components/PageTransition';

function DashboardLayout({ navLinks }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();


  useEffect(() => {
    async function closeSidebarOnNavigate() {
      setSidebarOpen(false);
    }
    closeSidebarOnNavigate();
  }, [location.pathname]);

  // Locks background scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar links={navLinks} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {/* min-w-0 lets this flex item actually shrink below its content's
            natural width — without it, a wide table forces the whole
            layout wider instead of scrolling within its own container. */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;