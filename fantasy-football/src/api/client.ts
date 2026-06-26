import axios from "axios";

const BASE_URL = import.meta.env.DEV
  ? "/fantasy-api"
  : "https://apifantasy.footballplus.tv";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Attach token on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("fantasy_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("fantasy_token");
      localStorage.removeItem("fantasy_user");
      window.location.href = "/fantasy/login";
    }
    return Promise.reject(error);
  }
);
