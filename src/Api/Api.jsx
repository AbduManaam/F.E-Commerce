import axios from "axios";

const goApi = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

// REQUEST
goApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE
goApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint = originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/signup") ||
      originalRequest?.url?.includes("/auth/verify-otp") ||
      originalRequest?.url?.includes("/auth/forgot-password") ||
      originalRequest?.url?.includes("/auth/reset-password");

    if (isAuthEndpoint) {
      return Promise.reject(error); // ✅ pass error back to caller
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await goApi.post("/auth/refresh");
        const newToken = res.data.access_token;

        localStorage.setItem("access_token", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return goApi(originalRequest);
      } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        // Let AuthContext handle redirect with return-URL state
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default goApi;
