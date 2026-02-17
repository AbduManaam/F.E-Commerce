import axios from 'axios';

// Environment configuration
const ENV = {
  development: {
    API_URL: 'http://localhost:8080',
    TIMEOUT: 30000,
  },
  production: {
    API_URL: import.meta.env.VITE_API_URL || 'https://api.yourdomain.com',
    TIMEOUT: 30000,
  }
};

const currentEnv = import.meta.env.MODE || 'development';
const config = ENV[currentEnv];

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: config.API_URL,
      timeout: config.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true, // Critical for cookies
    });

    this.initializeInterceptors();
  }

  initializeInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        // Log request in development
        if (currentEnv === 'development') {
          console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
            data: config.data,
            headers: config.headers,
            requestId: config.headers['X-Request-ID']
          });
        }

        return config;
      },
      (error) => {
        console.error('❌ [API] Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development
        if (currentEnv === 'development') {
          console.log(`✅ [API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            data: response.data,
            requestId: response.config.headers['X-Request-ID']
          });
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Log error
        console.error('❌ [API] Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          url: originalRequest?.url,
          requestId: originalRequest?.headers?.['X-Request-ID']
        });

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshResponse = await this.refreshToken();

            if (refreshResponse.success) {
              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Token refresh failed - logout user
            this.logout();
            window.location.href = '/login?session=expired';
          }
        }

        // Handle specific error codes
        if (error.response?.status === 403) {
          const errorCode = error.response.data?.code;

          if (errorCode === 'USER_BLOCKED') {
            this.logout();
            window.location.href = '/login?blocked=true';
          }
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  normalizeError(error) {
    if (error.response) {
      // Server responded with error
      return {
        status: error.response.status,
        code: error.response.data?.code || 'UNKNOWN_ERROR',
        message: error.response.data?.message || error.response.data?.error || 'An error occurred',
        details: error.response.data,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please check your internet connection.',
      };
    } else {
      // Request setup error
      return {
        status: 0,
        code: 'REQUEST_ERROR',
        message: error.message || 'Request failed',
      };
    }
  }

  // Auth methods
  async login(email, password) {
    try {
      const response = await this.client.post('/auth/login', { email, password });

      const { access_token, user, message } = response.data;

      if (access_token) {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('token_timestamp', Date.now().toString());
      }

      return {
        success: true,
        user,
        message,
        accessToken: access_token,
      };
    } catch (error) {
      return {
        success: false,
        ...this.normalizeError(error),
      };
    }
  }

  async signup(userData) {
    try {
      const response = await this.client.post('/auth/signup', userData);
      return {
        success: true,
        message: response.data.message,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        ...this.normalizeError(error),
      };
    }
  }

  async verifyOTP(email, otp) {
    try {
      const response = await this.client.post('/auth/verify-otp', { email, otp });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        ...this.normalizeError(error),
      };
    }
  }

  async refreshToken() {
    try {
      const response = await this.client.post('/auth/refresh');
      const { access_token } = response.data;

      if (access_token) {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('token_timestamp', Date.now().toString());
        return { success: true, accessToken: access_token };
      }

      return { success: false };
    } catch (error) {
      return { success: false, ...this.normalizeError(error) };
    }
  }

  async forgotPassword(email) {
    try {
      const response = await this.client.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        ...this.normalizeError(error),
      };
    }
  }

  async resetPassword(email, otp, newPassword) {
    try {
      const response = await this.client.post('/auth/reset-password', {
        email,
        otp,
        new_password: newPassword,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        ...this.normalizeError(error),
      };
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await this.client.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        ...this.normalizeError(error),
      };
    }
  }

  async resendVerification(email) {
    try {
      const response = await this.client.post('/auth/resend-verification', { email });
      return {
        success: true,
        message: response.data.msg || response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        ...this.normalizeError(error),
      };
    }
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('token_timestamp');
    }
  }

  async getProfile() {
    try {
      const response = await this.client.get('/user/profile');
      return {
        success: true,
        user: response.data,
      };
    } catch (error) {
      return {
        success: false,
        ...this.normalizeError(error),
      };
    }
  }

  // Fetch filtered products from backend
  async getFilteredProducts(params) {
    try {
      const response = await this.client.get('/products/filter', { params });

      // If backend returns array directly
      if (Array.isArray(response.data)) {
        return {
          success: true,
          data: {
            products: response.data,
            total: response.data.length,
          },
        };
      }

      // If backend returns { products: [], total: number }
      if (response.data.products) {
        return {
          success: true,
          data: response.data,
        };
      }

      // Fallback
      return {
        success: true,
        data: {
          products: [],
          total: 0,
        },
      };

    } catch (error) {
      return {
        success: false,
        ...this.normalizeError(error),
      };
    }
  }


  // In ApiService class

  // --- CART ---
  async getCart() {
    try {
      const res = await this.client.get("/api/cart");
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, ...this.normalizeError(err) };
    }
  }

  async addToCart(productId, quantity = 1) {
    try {
      const res = await this.client.post("/api/cart", { product_id: productId, quantity });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, ...this.normalizeError(err) };
    }
  }

  async updateCartItem(itemId, quantity) {
    try {
      const res = await this.client.put(`/api/cart/item/${itemId}`, { quantity });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, ...this.normalizeError(err) };
    }
  }

  async removeCartItem(itemId) {
    try {
      const res = await this.client.delete(`/api/cart/item/${itemId}`);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, ...this.normalizeError(err) };
    }
  }

  // --- WISHLIST ---
  async getWishlist() {
    try {
      const res = await this.client.get("/api/wishlist");
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, ...this.normalizeError(err) };
    }
  }

  async addToWishlist(productId) {
    try {
      const res = await this.client.post("/api/wishlist", { product_id: productId });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, ...this.normalizeError(err) };
    }
  }

  async removeFromWishlist(productId) {
    try {
      const res = await this.client.delete(`/api/wishlist/${productId}`);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, ...this.normalizeError(err) };
    }
  }

  // Move wishlist item → cart
  async moveWishlistToCart(productId, quantity = 1) {
    try {
      const addCart = await this.addToCart(productId, quantity);
      if (!addCart.success) throw new Error("Failed to add to cart");
      const removeWishlist = await this.removeFromWishlist(productId);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Operation failed" };
    }
  }



}

export default new ApiService();