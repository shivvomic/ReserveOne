import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, CalendarCheck, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchMyBookings } from '../../services/bookingService';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';

function StudentDashboardPage() {
  const { user, lastBookingEvent } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings()
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lastBookingEvent]);

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const approvedCount = bookings.filter((b) => b.status === 'APPROVED').length;

  return (
    <div>
      <PageHeader title={`Welcome back, ${user.name}`} subtitle="Here's a quick look at your bookings." />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-[86px] w-full rounded-card" />)
        ) : (
          <>
            <StatCard label="Total bookings" value={bookings.length} icon={CalendarCheck} />
            <StatCard label="Pending approval" value={pendingCount} icon={Clock} tone="warning" />
            <StatCard label="Approved" value={approvedCount} icon={CheckCircle2} tone="success" />
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/student/resources">
          <Button variant="primary">
            <Compass className="h-4 w-4" />
            Browse resources
          </Button>
        </Link>
        <Link to="/student/bookings">
          <Button variant="secondary">
            <CalendarCheck className="h-4 w-4" />
            View my bookings
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default StudentDashboardPage;