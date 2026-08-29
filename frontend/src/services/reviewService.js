import api from './api';

export async function fetchResourceReviews(resourceId, page = 1) {
  const response = await api.get(`/resources/${resourceId}/reviews`, { params: { page } });
  return response.data.data; // { reviews, averageRating, totalCount, page, totalPages }
}

export async function submitResourceReview(resourceId, { rating, comment }) {
  const response = await api.post(`/resources/${resourceId}/reviews`, { rating, comment });
  return response.data.data;
}