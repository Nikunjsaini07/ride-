import axios from "axios";

// In dev, calls go to "/api" (proxied to the backend by Vite).
// In production (e.g. Vercel), set VITE_API_URL to your backend URL,
// e.g. https://your-app.onrender.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Attach JWT from localStorage to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
