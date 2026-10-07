import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add real auth token and user headers
apiClient.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('wallart-auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed?.state?.token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
        if (parsed?.state?.user?.id && !config.headers['X-User-Id']) {
          config.headers['X-User-Id'] = String(parsed.state.user.id);
        }
      } catch {
        // ignore
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
