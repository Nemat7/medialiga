import axios from "axios";

// In dev, requests go through the Vite proxy (bypasses CORS on localhost).
// In production, the real domain is already whitelisted on the API server.
const BASE_URL = import.meta.env.DEV
  ? "/fantasy-api"
  : "https://apifantasy.footballplus.tv/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("fantasy_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
