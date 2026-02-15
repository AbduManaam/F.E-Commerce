import Api from "../Api/Api";

const authService = {
  // Login with email and password
  async login(email, password) {
    try {
      const response = await Api.post("/auth/login", {
        email,
        password,
      });
      
      const { access_token, user, message } = response.data;
      
      if (access_token) {
        // Store access token in localStorage
        localStorage.setItem("access_token", access_token);
      }
      
      return {
        success: true,
        user: user || { email, role: "user" },
        message,
        accessToken: access_token,
      };
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }
      
      if (error.response?.status === 403) {
        if (error.response?.data?.code === "USER_BLOCKED") {
          return {
            success: false,
            message: "Account blocked. Contact support.",
          };
        }
        
        if (error.response?.data?.code === "EMAIL_NOT_VERIFIED") {
          return {
            success: false,
            message: "Please verify your email before logging in.",
          };
        }
      }
      
      return {
        success: false,
        message: error.response?.data?.error || "Login failed. Please try again.",
      };
    }
  },

  // Signup new user
  async signup(name, email, password) {
    try {
      const response = await Api.post("/auth/signup", {
        name,
        email,
        password,
      });
      
      return {
        success: true,
        message: response.data.message || "Signup successful. Please check email for OTP.",
      };
    } catch (error) {
      console.error("Signup error:", error);
      
      if (error.response?.status === 400) {
        if (error.response?.data?.code === "USER_EXISTS") {
          return {
            success: false,
            message: "User already exists with this email",
          };
        }
      }
      
      return {
        success: false,
        message: error.response?.data?.error || "Signup failed. Please try again.",
      };
    }
  },

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const response = await Api.post("/auth/verify-otp", {
        email,
        otp,
      });
      
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("OTP verification error:", error);
      return {
        success: false,
        message: error.response?.data?.error || "Invalid OTP",
      };
    }
  },

  // Logout
  async logout() {
    try {
      await Api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear frontend tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("isAdmin");
    }
  },

  // Get user profile
  async getProfile() {
    try {
      const response = await Api.get("/user/profile");
      return {
        success: true,
        user: response.data,
      };
    } catch (error) {
      console.error("Profile fetch error:", error);
      return {
        success: false,
        message: error.response?.data?.error || "Failed to fetch profile",
      };
    }
  },

  // Refresh token (handled automatically by interceptor)
  async refreshToken() {
    try {
      const response = await Api.post("/auth/refresh");
      const { access_token } = response.data;
      
      if (access_token) {
        localStorage.setItem("access_token", access_token);
      }
      
      return { success: true, accessToken: access_token };
    } catch (error) {
      console.error("Token refresh error:", error);
      return { success: false };
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await Api.post("/auth/forgot-password", { email });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        message: error.response?.data?.error || "Failed to send reset email",
      };
    }
  },

  // Reset password with OTP
  async resetPassword(email, otp, newPassword) {
    try {
      const response = await Api.post("/auth/reset-password-with-otp", {
        email,
        otp,
        new_password: newPassword,
      });
      
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: error.response?.data?.error || "Failed to reset password",
      };
    }
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await Api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        message: error.response?.data?.error || "Failed to change password",
      };
    }
  },
  // ----------------------------------------
// UTILITY METHODS - ADD THESE
// ----------------------------------------

isAuthenticated() {
  return !!localStorage.getItem('access_token');
},

getToken() {
  return localStorage.getItem('access_token');
},

isTokenExpired() {
  const timestamp = localStorage.getItem('token_timestamp');
  if (!timestamp) return true;
  
  const tokenAge = Date.now() - parseInt(timestamp);
  const maxAge = 15 * 60 * 1000; // 15 minutes
  return tokenAge > maxAge;
},

clearAuth() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token_timestamp');
  localStorage.removeItem('user');
  localStorage.removeItem('isAdmin');
},
};



export default authService;





//------------------------------------------------------------------------------------------




// import Api from "../Api/Api";

// const authService = {
//   // ------------------------
//   // LOGIN
//   // ------------------------
//   async login(email, password) {
//     try {
//       const response = await Api.post("/auth/login", {
//         email: email.trim(),
//         password,
//       });

//       const { access_token, user, message } = response.data;

//       if (access_token) {
//         localStorage.setItem("access_token", access_token);
//       }

//       return {
//         success: true,
//         user,
//         message,
//       };
//     } catch (error) {
//       const status = error.response?.status;
//       const data = error.response?.data;

//       if (status === 401) {
//         return { success: false, message: "Invalid email or password" };
//       }

//       if (status === 403) {
//         return {
//           success: false,
//           message: data?.error || "Access denied",
//           code: data?.code,
//         };
//       }

//       return {
//         success: false,
//         message: data?.error || "Login failed",
//       };
//     }
//   },

//   // ------------------------
//   // SIGNUP
//   // ------------------------
//   async signup(name, email, password) {
//     try {
//       const response = await Api.post("/auth/signup", {
//         name: name.trim(),
//         email: email.trim().toLowerCase(),
//         password,
//       });

//       return {
//         success: true,
//         message: response.data.message,
//       };
//     } catch (error) {
//       return {
//         success: false,
//         message: error.response?.data?.error || "Signup failed",
//       };
//     }
//   },

//   // ------------------------
//   // VERIFY OTP
//   // ------------------------
//   async verifyOTP(email, otp) {
//     try {
//       const response = await Api.post("/auth/verify-otp", {
//         email: email.trim().toLowerCase(),
//         otp: otp.trim(),
//       });

//       return {
//         success: true,
//         message: response.data.message,
//       };
//     } catch (error) {
//       return {
//         success: false,
//         message: error.response?.data?.error || "Invalid OTP",
//       };
//     }
//   },

//   // ------------------------
//   // PROFILE
//   // ------------------------
//   async getProfile() {
//     try {
//       const response = await Api.get("/user/profile");

//       return {
//         success: true,
//         user: response.data,
//       };
//     } catch (error) {
//       if (error.response?.status === 401) {
//         return { success: false, authError: true };
//       }

//       return {
//         success: false,
//         message: error.response?.data?.error || "Failed to fetch profile",
//       };
//     }
//   },

//   // ------------------------
//   // LOGOUT
//   // ------------------------
//   async logout() {
//     try {
//       await Api.post("/auth/logout");
//     } catch (e) {
//       console.error(e);
//     } finally {
//       this.clearAuth();
//     }
//   },

//   // ------------------------
//   // TOKEN UTILS
//   // ------------------------
//   isAuthenticated() {
//     return !!localStorage.getItem("access_token");
//   },

//   getToken() {
//     return localStorage.getItem("access_token");
//   },

//   clearAuth() {
//     localStorage.removeItem("access_token");
//   },
// };

// export default authService;
