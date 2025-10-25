// frontend/src/lib/api.ts

import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: baseURL,
});

// Interceptor to add the JWT access token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // ***** CHANGE TOKEN KEY and PREFIX *****
      const token = localStorage.getItem('access_token'); // Get the access token
      if (token) {
        // Use 'Bearer' prefix (or 'JWT ' if you prefer, matching SIMPLE_JWT settings)
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor for automatic token refresh (more advanced)
// api.interceptors.response.use(...)

export default api;