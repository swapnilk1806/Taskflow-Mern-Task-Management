import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem('taskflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.sessionStorage.getItem('taskflow_token')) {
      window.sessionStorage.removeItem('taskflow_token');
      window.dispatchEvent(new Event('taskflow:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.request) {
    return 'Cannot reach the TaskFlow API. Start the backend and check the API URL and CORS settings.';
  }

  return error.message || fallback;
}

export default api;
