import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Boxes, ClipboardList, Users, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchDashboardStats } from '../../services/statsService';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';

function AdminDashboardPage() {
  const { lastBookingEvent } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => toast.error('Could not load dashboard statistics.'))
      .finally(() => setLoading(false));
  }, [lastBookingEvent]);

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Overview of resources, bookings, and users." />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading || !stats ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-[86px] w-full rounded-card" />)
        ) : (
          <>
            <StatCard label="Total Resources" value={stats.totalResources} icon={Boxes} />
            <StatCard label="Total Bookings" value={stats.totalBookings} icon={ClipboardList} />
            <StatCard label="Total Users" value={stats.totalUsers} icon={Users} />
            <StatCard label="Pending Bookings" value={stats.pendingBookings} icon={Clock} tone="warning" />
          </>
        )}
      </div>

      {!loading && stats && (
        <Card className="mt-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h2 className="font-semibold text-foreground">Most Booked Resources</h2>
          </div>
          {stats.mostBookedResources.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No bookings yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {stats.mostBookedResources.map((r, index) => (
                <li key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="text-foreground">
                      {r.name} <span className="text-muted-foreground">({r.category})</span>
                    </span>
                  </div>
                  <span className="font-medium text-muted">{r.booking_count} bookings</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link to="/admin/resources">
          <Button variant="primary">
            <Boxes className="h-4 w-4" />
            Manage Resources
          </Button>
        </Link>
        <Link to="/admin/bookings">
          <Button variant="secondary">
            <ClipboardList className="h-4 w-4" />
            View All Bookings
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboardPage;