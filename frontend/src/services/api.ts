import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";

const TOKEN_KEY = "soundscout_access_token";
const REFRESH_TOKEN_KEY = "soundscout_refresh_token";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - add auth header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle deactivated account (403 "Inactive user account")
    if (
      error.response?.status === 403 &&
      (error.response?.data as { detail?: string })?.detail === "Inactive user account"
    ) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.location.href = "/login?reason=deactivated";
      return Promise.reject(error);
    }

    // If error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry for auth endpoints (login, register, refresh)
      if (originalRequest.url?.includes("/auth/")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        // No refresh token, clear tokens and reject
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        processQueue(new Error("No refresh token"), null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Use plain axios to avoid interceptor loop
        const response = await axios.post(`${import.meta.env.VITE_API_URL || "/api/v1"}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data.access_token;
        localStorage.setItem(TOKEN_KEY, newAccessToken);

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        processQueue(new Error("Token refresh failed"), null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
