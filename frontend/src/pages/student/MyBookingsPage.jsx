import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Compass, FileText, X, CalendarX } from 'lucide-react';
import { fetchMyBookings, cancelBooking } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';

function formatTime(timeStr) {
  return timeStr.slice(0, 5);
}

function BookingRowActions({ booking, onCancel }) {
  return (
    <div className="flex items-center gap-4">
      <Link
        to={`/student/bookings/${booking.id}/undertaking`}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <FileText className="h-3.5 w-3.5" />
        Undertaking
      </Link>
      {['PENDING', 'APPROVED'].includes(booking.status) && (
        <button
          onClick={() => onCancel(booking)}
          className="inline-flex items-center gap-1 text-sm font-medium text-red-400 transition-colors hover:text-red-300"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      )}
    </div>
  );
}

function MyBookingsPage() {
  const { lastBookingEvent } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (error) {
      console.error(error);
      toast.error('Could not load your bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchInitialBookings() {
      await loadBookings();
    }
    fetchInitialBookings();
  }, [loadBookings, lastBookingEvent]);

  async function handleConfirmCancel() {
    setCancelling(true);
    try {
      await cancelBooking(cancelTarget.id);
      toast.success('Booking cancelled');
      setCancelTarget(null);
      loadBookings();
    } catch (error) {
      const message = error.response?.data?.message || 'Could not cancel this booking.';
      toast.error(message);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="My Bookings"
        action={
          <Link to="/student/resources">
            <Button variant="secondary" size="sm">
              <Compass className="h-3.5 w-3.5" />
              Browse resources
            </Button>
          </Link>
        }
      />

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-card" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No bookings yet"
            description="Browse resources and submit a booking request to see it here."
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-card border border-border bg-surface md:block">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-surface-hover/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted">Resource</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Time</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="transition-colors hover:bg-surface-hover/40">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{booking.resource_name}</div>
                        <div className="text-xs text-muted-foreground">{booking.resource_category}</div>
                      </td>
                      <td className="px-4 py-3 text-muted">{booking.booking_date}</td>
                      <td className="px-4 py-3 text-muted">
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <BookingRowActions booking={booking} onCancel={setCancelTarget} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-card border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{booking.resource_name}</p>
                      <p className="text-xs text-muted-foreground">{booking.resource_category}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-muted">
                    <span>{booking.booking_date}</span>
                    <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <BookingRowActions booking={booking} onCancel={setCancelTarget} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel this booking?"
        description={cancelTarget ? `${cancelTarget.resource_name} on ${cancelTarget.booking_date}` : ''}
        confirmLabel="Cancel booking"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
        loading={cancelling}
      />
    </div>
  );
}

export default MyBookingsPage;