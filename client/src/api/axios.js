import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

const STORAGE_KEYS = [
  'accessToken', 'refreshToken', 'authToken', 'user',
  'student_accessToken', 'student_refreshToken', 'student_user',
  'vendor_accessToken', 'vendor_refreshToken', 'vendor_user',
  'admin_accessToken', 'admin_refreshToken', 'admin_user',
];

// Clear both sessionStorage and localStorage auth keys on logout / refresh failure
const clearAuthStorage = () => {
  sessionStorage.clear();
  STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

export { clearAuthStorage };

// Helper to get active token for current browser tab/session
export const getActiveToken = () => {
  // 1. Check tab-isolated sessionStorage
  const sessionToken = sessionStorage.getItem('accessToken') || sessionStorage.getItem('authToken');
  if (sessionToken) return sessionToken;

  // 2. Check role-specific sessionStorage
  const path = window.location.pathname;
  if (path.startsWith('/student')) {
    return sessionStorage.getItem('student_accessToken') || localStorage.getItem('student_accessToken');
  }
  if (path.startsWith('/vendor')) {
    return sessionStorage.getItem('vendor_accessToken') || localStorage.getItem('vendor_accessToken');
  }
  if (path.startsWith('/admin')) {
    return sessionStorage.getItem('admin_accessToken') || localStorage.getItem('admin_accessToken');
  }

  // 3. Fallback
  return localStorage.getItem('accessToken');
};

// Request interceptor — attach token from tab's sessionStorage
API.interceptors.request.use((config) => {
  const token = getActiveToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 & refresh using session-isolated token
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post('/api/auth/refresh-token', { refreshToken });
          const newAccessToken = data.data.accessToken;
          const newRefreshToken = data.data.refreshToken;

          // Update tab-isolated sessionStorage
          sessionStorage.setItem('accessToken', newAccessToken);
          sessionStorage.setItem('authToken', newAccessToken);
          sessionStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        clearAuthStorage();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
