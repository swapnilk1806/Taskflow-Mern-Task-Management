import api from './axiosInstance.js';

export async function registerUser(details) {
  const { data } = await api.post('/auth/register', details);
  return data.data;
}

export async function loginUser(credentials) {
  const { data } = await api.post('/auth/login', credentials);
  return data.data;
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data.data.user;
}
