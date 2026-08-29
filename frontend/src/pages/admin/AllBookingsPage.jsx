import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Check, X, Pencil, Ban, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchAllBookings, updateBookingStatus, modifyBooking, cancelBooking } from '../../services/bookingService';
import { getInitials } from '../../utils/getInitials';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import ModifyBookingDialog from '../../components/ModifyBookingDialog';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import Skeleton from '../../components/Skeleton';

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

function formatTime(timeStr) {
  return timeStr.slice(0, 5);
}

function BookingActions({ booking, actioningId, onDecision, onModify, onCancel }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {booking.status === 'PENDING' && (
        <>
          <button
            onClick={() => onDecision(booking, 'APPROVED')}
            disabled={actioningId === booking.id}
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            Approve
          </button>
          <button
            onClick={() => onDecision(booking, 'REJECTED')}
            disabled={actioningId === booking.id}
            className="inline-flex items-center gap-1 text-sm font-medium text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </button>
        </>
      )}
      {['PENDING', 'APPROVED'].includes(booking.status) && (
        <>
          <button
            onClick={() => onModify(booking)}
            className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modify
          </button>
          <button
            onClick={() => onCancel(booking)}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <Ban className="h-3.5 w-3.5" />
            Cancel
          </button>
        </>
      )}
    </div>
  );
}

function AllBookingsPage() {
  const { lastBookingEvent } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actioningId, setActioningId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [modifyTarget, setModifyTarget] = useState(null);
  const [modifying, setModifying] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllBookings({ status: statusFilter });
      setBookings(data);
    } catch (error) {
      console.error(error);
      toast.error('Could not load bookings.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
  async function fetchInitialData() {
    await loadBookings();
  }
  fetchInitialData();
}, [loadBookings, lastBookingEvent]);

  async function handleDecision(booking, status) {
    setActioningId(booking.id);
    try {
      await updateBookingStatus(booking.id, status);
      toast.success(`Booking ${status.toLowerCase()}`);
      loadBookings();
    } catch (error) {
      const message = error.response?.data?.message || 'Could not update this booking.';
      toast.error(message);
    } finally {
      setActioningId(null);
    }
  }

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

  async function handleModifySubmit(formData) {
    setModifying(true);
    try {
      await modifyBooking(modifyTarget.id, { resourceId: modifyTarget.resource_id, ...formData });
      toast.success('Booking updated — back to pending approval');
      setModifyTarget(null);
      loadBookings();
    } catch (error) {
      const message = error.response?.data?.message || 'Could not modify this booking.';
      toast.error(message);
    } finally {
      setModifying(false);
    }
  }

  return (
    <div>
      <PageHeader title="All Bookings" />

      <div className="mt-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-48">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-card" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No bookings found" description="Try a different status filter." />
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-card border border-border bg-surface md:block">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-surface-hover/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted">Resource</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Student</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Time</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="transition-colors hover:bg-surface-hover/40">
                      <td className="px-4 py-3 font-medium text-foreground">{booking.resource_name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                            {getInitials(booking.user_name)}
                          </span>
                          <div>
                            <div className="text-foreground">{booking.user_name}</div>
                            <div className="text-xs text-muted-foreground">{booking.user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{booking.booking_date}</td>
                      <td className="px-4 py-3 text-muted">
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <BookingActions
                          booking={booking}
                          actioningId={actioningId}
                          onDecision={handleDecision}
                          onModify={setModifyTarget}
                          onCancel={setCancelTarget}
                        />
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
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                        {getInitials(booking.user_name)}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{booking.user_name}</p>
                        <p className="text-xs text-muted-foreground">{booking.user_email}</p>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="mt-3 text-sm text-muted">
                    <p className="font-medium text-foreground">{booking.resource_name}</p>
                    <p>{booking.booking_date} · {formatTime(booking.start_time)} - {formatTime(booking.end_time)}</p>
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <BookingActions
                      booking={booking}
                      actioningId={actioningId}
                      onDecision={handleDecision}
                      onModify={setModifyTarget}
                      onCancel={setCancelTarget}
                    />
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
        description={cancelTarget ? `${cancelTarget.resource_name} for ${cancelTarget.user_name} on ${cancelTarget.booking_date}` : ''}
        confirmLabel="Cancel booking"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
        loading={cancelling}
      />

      {modifyTarget && (
        <ModifyBookingDialog
          key={modifyTarget.id}
          booking={modifyTarget}
          onSubmit={handleModifySubmit}
          onCancel={() => setModifyTarget(null)}
          submitting={modifying}
        />
      )}
    </div>
  );
}

export default AllBookingsPage;