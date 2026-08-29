import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, Clock, Info } from 'lucide-react';
import { fetchResourceById, fetchResourceAvailability } from '../../services/resourceService';
import { createBooking } from '../../services/bookingService';
import { isValidReason } from '../../utils/validators';
import { UNDERTAKING_TEXT } from '../../utils/undertakingText';
import FormField from '../../components/FormField';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';

function todayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

function CreateBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [loadingResource, setLoadingResource] = useState(true);
  const [formData, setFormData] = useState({ bookingDate: '', startTime: '', endTime: '', reason: '' });
  const [undertakingAccepted, setUndertakingAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [bookedRanges, setBookedRanges] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    fetchResourceById(id)
      .then(setResource)
      .catch(() => {
        toast.error('Resource not found.');
        navigate('/student/resources');
      })
      .finally(() => setLoadingResource(false));
  }, [id, navigate]);

useEffect(() => {
    // Exit cleanly without triggering a synchronous setState
    if (!formData.bookingDate) return;

    let isMounted = true;

    async function checkAvailability() {
      setLoadingAvailability(true);
      try {
        const data = await fetchResourceAvailability(id, formData.bookingDate);
        if (isMounted) {
          setBookedRanges(data.bookedRanges);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setLoadingAvailability(false);
        }
      }
    }

    checkAvailability();

    return () => {
      isMounted = false;
    };
  }, [id, formData.bookingDate]);
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function validate() {
    const newErrors = {};
    if (!formData.bookingDate) {
      newErrors.bookingDate = 'Please choose a date';
    } else if (formData.bookingDate < todayIsoDate()) {
      newErrors.bookingDate = 'Date cannot be in the past';
    }
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    if (!isValidReason(formData.reason)) {
      newErrors.reason = 'Please provide a reason (10-500 characters)';
    }
    if (!undertakingAccepted) {
      newErrors.undertaking = 'You must accept the undertaking to continue';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createBooking({
        resourceId: Number(id),
        ...formData,
        reason: formData.reason.trim(),
        undertakingAccepted,
      });
      toast.success('Booking request submitted');
      navigate('/student/bookings');
    } catch (error) {
      const message = error.response?.data?.message || 'Could not create booking. Please try again.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingResource) return <LoadingSpinner label="Loading resource..." />;
  if (!resource) return null;

  return (
    <div className="max-w-md">
      <Link to={`/student/resources/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {resource.name}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-foreground">Book {resource.name}</h1>
      <p className="mt-1 text-sm text-muted">{resource.location}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <FormField label="Date" id="bookingDate" error={errors.bookingDate}>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="bookingDate"
              name="bookingDate"
              type="date"
              min={todayIsoDate()}
              value={formData.bookingDate}
              onChange={handleChange}
              className="input-field pl-10"
            />
          </div>
        </FormField>

        {formData.bookingDate && (
          <div className="rounded-input border border-border bg-surface p-3 text-xs text-muted">
            {loadingAvailability ? (
              'Checking existing bookings...'
            ) : bookedRanges.length === 0 ? (
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                No bookings yet for this date.
              </span>
            ) : (
              <>
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  Already booked (a 30-min gap is required after each):
                </p>
                <ul className="mt-2 space-y-1.5">
                  {bookedRanges.map((r, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span>{r.start_time.slice(0, 5)} - {r.end_time.slice(0, 5)}</span>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start time" id="startTime" error={errors.startTime}>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>
          </FormField>

          <FormField label="End time" id="endTime" error={errors.endTime}>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>
          </FormField>
        </div>

        <FormField label="Reason for booking" id="reason" error={errors.reason}>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            value={formData.reason}
            onChange={handleChange}
            placeholder="e.g. Group project meeting for the Databases course"
            className="input-field"
          />
        </FormField>

        <div className="rounded-input border border-border bg-surface p-3">
          <p className="text-xs leading-relaxed text-muted">{UNDERTAKING_TEXT}</p>
          <label className="mt-3 flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={undertakingAccepted}
              onChange={(e) => setUndertakingAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border bg-surface"
            />
            I have read and accept the undertaking above.
          </label>
          {errors.undertaking && <p className="mt-1 text-sm text-red-400">{errors.undertaking}</p>}
        </div>

        <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
          Submit booking request
        </Button>
      </form>
    </div>
  );
}

export default CreateBookingPage;