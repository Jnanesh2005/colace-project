import axios from 'axios';

// Get the API base URL from the environment variable
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: baseURL, // Use the variable here
});

// Interceptor to add the auth token (no changes here)
api.interceptors.request.use(
  (config) => {
    // Check if running on the client-side before accessing localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;