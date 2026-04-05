// ============================================================
// API Service — Axios instance with auth interceptor
// ============================================================
// All HTTP requests to the backend go through this.
// It automatically attaches the JWT token to every request.
// ============================================================

import axios from "axios";

const API_URL = "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ──────────────────────────────────────
// Before every request, attach the JWT token from localStorage.
// This way you don't have to manually add the token every time.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor ─────────────────────────────────────
// If we get a 401 (unauthorized), clear the token and redirect
// to login. This handles expired tokens automatically.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
