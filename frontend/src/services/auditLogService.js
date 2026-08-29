import api from './api';

export async function fetchAuditLogs({ action, page = 1 } = {}) {
  const params = { page };
  if (action) params.action = action;
  const response = await api.get('/admin/audit-logs', { params });
  return response.data.data; // { logs, totalCount, page, totalPages }
}