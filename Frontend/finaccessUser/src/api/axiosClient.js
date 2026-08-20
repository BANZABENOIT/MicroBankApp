import axios from "axios";

const API_BASE_URL =
  "http://localhost/FinAccessTp/FinAccess/Backend/public/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("finaccess_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes("/login") || error.config?.url?.includes("/register");
    if (error.response && error.response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("finaccess_token");
      localStorage.removeItem("finaccess_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
