import api from './api';

export async function createBooking({ resourceId, bookingDate, startTime, endTime, reason, undertakingAccepted }) {
  const response = await api.post('/bookings', {
    resourceId,
    bookingDate,
    startTime,
    endTime,
    reason,
    undertakingAccepted,
  });
  return response.data.data;
}

export async function fetchMyBookings() {
  const response = await api.get('/bookings/my');
  return response.data.data;
}

export async function fetchAllBookings({ status } = {}) {
  const params = {};
  if (status) params.status = status;

  const response = await api.get('/bookings', { params });
  return response.data.data;
}

export async function updateBookingStatus(id, status) {
  const response = await api.put(`/bookings/${id}/status`, { status });
  return response.data.data;
}

export async function cancelBooking(id) {
  const response = await api.delete(`/bookings/${id}`);
  return response.data.data;
}

export async function modifyBooking(id, { resourceId, bookingDate, startTime, endTime }) {
  const response = await api.put(`/bookings/${id}`, { resourceId, bookingDate, startTime, endTime });
  return response.data.data;
}

export async function downloadUndertakingPdf(id) {
  const response = await api.get(`/bookings/${id}/undertaking/pdf`, { responseType: 'blob' });
  return response.data; // Blob
}

