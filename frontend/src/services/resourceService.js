import api from './api';

export async function fetchResources({ search, category, status } = {}) {
  const params = {};
  if (search) params.search = search;
  if (category) params.category = category;
  if (status) params.status = status;

  const response = await api.get('/resources', { params });
  return response.data.data;
}

export async function fetchResourceById(id) {
  const response = await api.get(`/resources/${id}`);
  return response.data.data;
}

export async function createResource(data) {
  const response = await api.post('/resources', data);
  return response.data.data;
}

export async function updateResource(id, data) {
  const response = await api.put(`/resources/${id}`, data);
  return response.data.data;
}

export async function deleteResource(id) {
  const response = await api.delete(`/resources/${id}`);
  return response.data.data;
}

export async function fetchResourceAvailability(resourceId, date) {
  const response = await api.get(`/resources/${resourceId}/availability`, { params: { date } });
  return response.data.data;
}