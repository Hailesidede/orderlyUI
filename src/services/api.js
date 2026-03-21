import axios from 'axios';
// We dynamically import the store inside the interceptors to prevent
// circular dependency errors between Pinia and Axios during app boot.
import { useAuthStore } from '../stores/auth';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- QUEUE MANAGEMENT STATE ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- REQUEST INTERCEPTOR ---
apiClient.interceptors.request.use(
  config => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR ---
apiClient.interceptors.response.use(
  response => response, // Pass through successful responses
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Check if the error is 401, we have a config, and we haven't already retried this exact request
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // If a refresh is already happening, queue this request until it finishes
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return apiClient(originalRequest); // Retry the original request
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      // Lock the queue: we are the first request to fail, we initiate the refresh
      originalRequest._retry = true;
      isRefreshing = true;
      const authStore = useAuthStore();

      try {
        // Hit the Spring Boot refresh endpoint.
        // We don't need to pass a payload; the HttpOnly cookie handles it.
        const response = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });

        const newAccessToken = response.data.accessToken;

        // Update Pinia state in memory
        authStore.setAccessToken(newAccessToken);

        // Process the queue: resolve all waiting requests with the new token
        processQueue(null, newAccessToken);

        // Retry the original request that triggered the 401
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If the refresh token itself is expired or invalid, the session is truly dead.
        processQueue(refreshError, null);
        authStore.logout(); // Purge memory and redirect to login
        return Promise.reject(refreshError);
      } finally {
        // Unlock the queue
        isRefreshing = false;
      }
    }

    // Return any other type of error (400, 403, 500) directly to the calling component
    return Promise.reject(error);
  }
);

export default apiClient;
