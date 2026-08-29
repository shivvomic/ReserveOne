import api from './api';

export async function registerUser({ name, email, password, rollNumber, registrationType, clubName }) {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
    rollNumber,
    registrationType,
    clubName,
  });
  return response.data.data; // { token, user }
}

export async function loginUser({ email, password }) {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
}

export async function fetchProfile() {
  const response = await api.get('/auth/profile');
  return response.data.data;
}

export async function updateUserProfile({ name }) {
  const response = await api.put('/auth/profile', { name });
  return response.data.data;
}