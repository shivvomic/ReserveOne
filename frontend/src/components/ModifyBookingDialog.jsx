import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import FormField from './FormField';
import Button from './Button';

function todayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

// Rendered with key={booking.id} by the parent, so React remounts (and
// re-initializes formData) fresh every time a different booking is
// targeted, instead of needing a useEffect to sync state on prop change.
function ModifyBookingDialog({ booking, onSubmit, onCancel, submitting }) {
  const [formData, setFormData] = useState({
    bookingDate: booking.booking_date,
    startTime: booking.start_time.slice(0, 5),
    endTime: booking.end_time.slice(0, 5),
  });
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function validate() {
    const newErrors = {};
    if (!formData.bookingDate) newErrors.bookingDate = 'Please choose a date';
    else if (formData.bookingDate < todayIsoDate()) newErrors.bookingDate = 'Date cannot be in the past';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="w-full max-w-sm rounded-modal border border-border bg-surface p-6 shadow-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <h2 className="text-lg font-semibold text-foreground">Modify booking</h2>
        <p className="mt-1 text-sm text-muted">
          {booking.resource_name} — this will return the booking to pending approval.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <FormField label="Date" id="modifyDate" error={errors.bookingDate}>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="modifyDate"
                name="bookingDate"
                type="date"
                min={todayIsoDate()}
                value={formData.bookingDate}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start time" id="modifyStart" error={errors.startTime}>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="modifyStart"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </FormField>
            <FormField label="End time" id="modifyEnd" error={errors.endTime}>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="modifyEnd"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </FormField>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Go back
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save changes
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default ModifyBookingDialog;