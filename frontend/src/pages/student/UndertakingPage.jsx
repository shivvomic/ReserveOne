import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { fetchMyBookings, downloadUndertakingPdf } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { UNDERTAKING_TEXT } from '../../utils/undertakingText';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString();
}

function formatTime(timeStr) {
  return timeStr.slice(0, 5);
}

function UndertakingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchMyBookings()
      .then((bookings) => {
        const match = bookings.find((b) => String(b.id) === id);
        if (!match) {
          toast.error('Booking not found.');
          navigate('/student/bookings');
          return;
        }
        setBooking(match);
      })
      .catch(() => {
        toast.error('Could not load this booking.');
        navigate('/student/bookings');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      const blob = await downloadUndertakingPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `undertaking-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error('Could not download the PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading booking..." />;
  if (!booking) return null;

  return (
    <div className="min-h-screen bg-background px-6 py-10 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link to="/student/bookings" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to my bookings
          </Link>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={handleDownloadPdf} loading={downloading}>
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
            <Button variant="primary" size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" />
              Print / Save as PDF
            </Button>
          </div>
        </div>

        <div className="rounded-card border border-border bg-white p-10 text-slate-900 shadow-2xl shadow-black/40 print:border-none print:p-0 print:shadow-none">
          <div className="border-b border-slate-300 pb-4">
            <h1 className="text-xl font-bold text-slate-900">Campus Resource Booking — Undertaking</h1>
            <p className="mt-1 text-sm text-slate-500">Booking reference #{booking.id}</p>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Booked by</dt>
              <dd className="font-medium text-slate-900">{user.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Roll number</dt>
              <dd className="font-medium text-slate-900">{user.rollNumber || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Resource</dt>
              <dd className="font-medium text-slate-900">{booking.resource_name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Category</dt>
              <dd className="font-medium text-slate-900">{booking.resource_category}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Date</dt>
              <dd className="font-medium text-slate-900">{booking.booking_date}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Time</dt>
              <dd className="font-medium text-slate-900">
                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium text-slate-900">{booking.status}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Requested on</dt>
              <dd className="font-medium text-slate-900">{formatDateTime(booking.created_at)}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-700">Reason for booking</h2>
            <p className="mt-1 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {booking.reason}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-700">Undertaking</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{UNDERTAKING_TEXT}</p>
            <p className="mt-4 text-sm text-slate-700">
              {booking.undertaking_accepted
                ? `Undertaking accepted electronically by ${user.name} at the time of booking.`
                : 'Undertaking not recorded for this booking.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UndertakingPage;