import axios from "axios";

// Go Fiber backend
export const goApi = axios.create({
    baseURL: "http://127.0.0.1:8080",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 10000 // 10 seconds timeout
});

// Request interceptor
goApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Don't log sensitive data in production
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, {
                data: config.data,
                headers: config.headers
            });
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
goApi.interceptors.response.use(
    (response) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error(`❌ ${error.response?.status || 'NETWORK'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                error: error.response?.data || error.message,
                headers: error.config?.headers
            });
        }
        
        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh the token
                const response = await goApi.post("/auth/refresh");
                
                if (response.data.access_token) {
                    localStorage.setItem("access_token", response.data.access_token);
                    originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
                    return goApi(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear auth and redirect to login
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
                localStorage.removeItem("isAdmin");
                
                // Only redirect if not already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                
                return Promise.reject(refreshError);
            }
        }
        
        // Handle 403 Forbidden - Blocked user
        if (error.response?.status === 403 && error.response?.data?.code === "USER_BLOCKED") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            localStorage.removeItem("isAdmin");
            window.location.href = '/login?blocked=true';
        }
        
        return Promise.reject(error);
    }
);

const Api = goApi;
export default Api;