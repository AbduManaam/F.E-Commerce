// import Api from "../Api/Api";

// const authService = {
//   // ----------------------------------------
//   // AUTHENTICATION
//   // ----------------------------------------
  
//   async login(email, password) {
//     try {
//       const response = await Api.post("/auth/login", {
//         email: email.trim(),
//         password,
//       });
      
//       const { access_token, user, message } = response.data;
      
//       if (access_token) {
//         localStorage.setItem("access_token", access_token);
//         localStorage.setItem("token_timestamp", Date.now().toString());
//       }
      
//       return {
//         success: true,
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role || "user",
//           isVerified: user.isVerified || true,
//           isBlocked: user.isBlocked || false,
//         },
//         message,
//         accessToken: access_token,
//       };
//     } catch (error) {
//       console.error("Login error:", error.response?.data || error.message);
      
//       const errorData = error.response?.data;
      
//       if (error.response?.status === 401) {
//         return {
//           success: false,
//           message: "Invalid email or password",
//         };
//       }
      
//       if (error.response?.status === 403) {
//         if (errorData?.code === "USER_BLOCKED") {
//           return {
//             success: false,
//             message: "Account blocked. Contact support.",
//             code: "USER_BLOCKED",
//           };
//         }
        
//         if (errorData?.code === "EMAIL_NOT_VERIFIED") {
//           return {
//             success: false,
//             message: "Please verify your email before logging in.",
//             code: "EMAIL_NOT_VERIFIED",
//             email: email,
//           };
//         }
//       }
      
//       return {
//         success: false,
//         message: errorData?.error || "Login failed. Please try again.",
//       };
//     }
//   },

//   async signup(name, email, password) {
//     try {
//       const response = await Api.post("/auth/signup", {
//         name: name.trim(),
//         email: email.trim().toLowerCase(),
//         password,
//       });
      
//       return {
//         success: true,
//         message: response.data.message || "Signup successful. Please check email for OTP.",
//         email: email,
//       };
//     } catch (error) {
//       console.error("Signup error:", error.response?.data || error.message);
      
//       const errorData = error.response?.data;
      
//       if (error.response?.status === 400) {
//         if (errorData?.code === "USER_EXISTS") {
//           return {
//             success: false,
//             message: "User already exists with this email",
//             code: "USER_EXISTS",
//           };
//         }
        
//         if (errorData?.errors) {
//           const firstError = Object.values(errorData.errors)[0];
//           return {
//             success: false,
//             message: firstError || "Validation failed",
//             errors: errorData.errors,
//           };
//         }
//       }
      
//       return {
//         success: false,
//         message: errorData?.error || "Signup failed. Please try again.",
//       };
//     }
//   },

//   async verifyOTP(email, otp) {
//     try {
//       const response = await Api.post("/auth/verify-otp", {
//         email: email.trim().toLowerCase(),
//         otp: otp.trim(),
//       });
      
//       return {
//         success: true,
//         message: response.data.message || "Account verified successfully!",
//       };
//     } catch (error) {
//       console.error("OTP verification error:", error.response?.data || error.message);
      
//       const errorData = error.response?.data;
      
//       if (error.response?.status === 400) {
//         if (errorData?.code === "INVALID_OTP") {
//           return {
//             success: false,
//             message: "Invalid OTP code",
//             code: "INVALID_OTP",
//           };
//         }
        
//         if (errorData?.code === "OTP_EXPIRED") {
//           return {
//             success: false,
//             message: "OTP expired. Please request a new one.",
//             code: "OTP_EXPIRED",
//           };
//         }
        
//         if (errorData?.code === "ALREADY_VERIFIED") {
//           return {
//             success: false,
//             message: "Email already verified",
//             code: "ALREADY_VERIFIED",
//           };
//         }
//       }
      
//       return {
//         success: false,
//         message: errorData?.error || "OTP verification failed",
//       };
//     }
//   },

//   async resendVerification(email) {
//     try {
//       const response = await Api.post("/auth/resend-verification", {
//         email: email.trim().toLowerCase(),
//       });
      
//       return {
//         success: true,
//         message: response.data.msg || "Verification OTP resent successfully",
//       };
//     } catch (error) {
//       console.error("Resend verification error:", error.response?.data || error.message);
      
//       return {
//         success: false,
//         message: error.response?.data?.error || "Failed to resend OTP",
//       };
//     }
//   },

//   // ----------------------------------------
//   // PASSWORD MANAGEMENT
//   // ----------------------------------------

//   async forgotPassword(email) {
//     try {
//       const response = await Api.post("/auth/forgot-password", {
//         email: email.trim().toLowerCase(),
//       });
      
//       return {
//         success: true,
//         message: response.data.message || "If the email exists, an OTP has been sent",
//         email: email,
//       };
//     } catch (error) {
//       console.error("Forgot password error:", error.response?.data || error.message);
      
//       return {
//         success: false,
//         message: error.response?.data?.error || "Failed to send reset email",
//       };
//     }
//   },

//   async resetPassword(email, otp, newPassword) {
//     try {
//       const response = await Api.post("/auth/reset-password-with-otp", {
//         email: email.trim().toLowerCase(),
//         otp: otp.trim(),
//         new_password: newPassword,
//       });
      
//       return {
//         success: true,
//         message: response.data.message || "Password reset successfully!",
//       };
//     } catch (error) {
//       console.error("Reset password error:", error.response?.data || error.message);
      
//       const errorData = error.response?.data;
      
//       if (error.response?.status === 400) {
//         if (errorData?.code === "INVALID_OTP") {
//           return {
//             success: false,
//             message: "Invalid OTP code",
//             code: "INVALID_OTP",
//           };
//         }
        
//         if (errorData?.code === "OTP_EXPIRED") {
//           return {
//             success: false,
//             message: "OTP expired. Please request a new one.",
//             code: "OTP_EXPIRED",
//           };
//         }
        
//         if (errorData?.code === "WEAK_PASSWORD") {
//           return {
//             success: false,
//             message: "Password must be at least 6 characters",
//             code: "WEAK_PASSWORD",
//           };
//         }
//       }
      
//       return {
//         success: false,
//         message: errorData?.error || "Failed to reset password",
//       };
//     }
//   },

//   async changePassword(currentPassword, newPassword) {
//     try {
//       const response = await Api.post("/auth/change-password", {
//         current_password: currentPassword,
//         new_password: newPassword,
//       });
      
//       return {
//         success: true,
//         message: response.data.message || "Password changed successfully!",
//       };
//     } catch (error) {
//       console.error("Change password error:", error.response?.data || error.message);
      
//       const errorData = error.response?.data;
      
//       if (error.response?.status === 400) {
//         if (errorData?.code === "PASSWORD_MISMATCH") {
//           return {
//             success: false,
//             message: "Current password is incorrect",
//             code: "PASSWORD_MISMATCH",
//           };
//         }
        
//         if (errorData?.code === "WEAK_PASSWORD") {
//           return {
//             success: false,
//             message: "New password must be at least 6 characters",
//             code: "WEAK_PASSWORD",
//           };
//         }
        
//         if (errorData?.code === "PASSWORD_REUSE") {
//           return {
//             success: false,
//             message: "New password cannot be the same as current password",
//             code: "PASSWORD_REUSE",
//           };
//         }
//       }
      
//       return {
//         success: false,
//         message: errorData?.error || "Failed to change password",
//       };
//     }
//   },

//   // ----------------------------------------
//   // USER PROFILE
//   // ----------------------------------------

//   async getProfile() {
//     try {
//       const response = await Api.get("/user/profile");
      
//       return {
//         success: true,
//         user: {
//           id: response.data.id,
//           name: response.data.name,
//           email: response.data.email,
//           role: response.data.role || "user",
//           isVerified: response.data.isVerified !== false,
//           isBlocked: response.data.isBlocked || false,
//           createdAt: response.data.createdAt,
//         },
//       };
//     } catch (error) {
//       console.error("Profile fetch error:", error.response?.data || error.message);
      
//       if (error.response?.status === 401) {
//         return { success: false, authError: true };
//       }
      
//       return {
//         success: false,
//         message: error.response?.data?.error || "Failed to fetch profile",
//       };
//     }
//   },

//   // ----------------------------------------
//   // SESSION MANAGEMENT
//   // ----------------------------------------

//   async logout() {
//     try {
//       await Api.post("/auth/logout");
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       this.clearAuth();
//     }
//   },

//   async refreshToken() {
//     try {
//       const response = await Api.post("/auth/refresh");
//       const { access_token } = response.data;
      
//       if (access_token) {
//         localStorage.setItem("access_token", access_token);
//         localStorage.setItem("token_timestamp", Date.now().toString());
//         return { success: true, accessToken: access_token };
//       }
      
//       return { success: false };
//     } catch (error) {
//       console.error("Token refresh error:", error);
//       this.clearAuth();
//       return { success: false };
//     }
//   },

//   // ----------------------------------------
//   // UTILITY METHODS ✅ ADD THESE
//   // ----------------------------------------

//   isAuthenticated() {
//     return !!localStorage.getItem('access_token');
//   },

//   getToken() {
//     return localStorage.getItem('access_token');
//   },

//   isTokenExpired() {
//     const timestamp = localStorage.getItem('token_timestamp');
//     if (!timestamp) return true;
    
//     const tokenAge = Date.now() - parseInt(timestamp);
//     const maxAge = 15 * 60 * 1000; // 15 minutes (matches your JWT expiry)
    
//     return tokenAge > maxAge;
//   },

//   clearAuth() {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('token_timestamp');
//     localStorage.removeItem('user');
//     localStorage.removeItem('isAdmin');
//   },
// };

// export default authService;

//.-------------------------------------------------------------------------------------------------------







// import React, { createContext, useContext, useEffect, useState } from "react";
// import authService from "../service/authService";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // ------------------------
//   // INITIALIZE AUTH
//   // ------------------------
//   useEffect(() => {
//     const init = async () => {
//       if (!authService.isAuthenticated()) {
//         setIsLoading(false);
//         return;
//       }

//       const result = await authService.getProfile();

//       if (result.success) {
//         setUser(result.user);
//       } else {
//         authService.clearAuth();
//       }

//       setIsLoading(false);
//     };

//     init();
//   }, []);

//   // ------------------------
//   // LOGIN
//   // ------------------------
//   const login = async (email, password) => {
//     const result = await authService.login(email, password);

//     if (result.success) {
//       setUser(result.user);
//     }

//     return result;
//   };

//   // ------------------------
//   // LOGOUT
//   // ------------------------
//   const logout = async () => {
//     await authService.logout();
//     setUser(null);
//   };

//   // ------------------------
//   // DERIVED STATES
//   // ------------------------
//   const isAuthenticated = !!user;
//   const isAdmin = user?.role === "admin";
//   const isUserBlocked = user?.isBlocked === true;

//   const value = {
//     user,
//     isAdmin,
//     isUserBlocked,
//     isAuthenticated,
//     isLoading,
//     login,
//     logout,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!isLoading && children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used inside AuthProvider");
//   }
//   return context;
// };



//------------------------------------------------------------------------------------------------







import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../service/authService'; // ✅ Import from service folder

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          setIsLoading(false);
          return;
        }

        const result = await authService.getProfile();
        
        if (result.success) {
          setUser(result.user);
          setIsAdmin(result.user.role === 'admin');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.user);
      setIsAdmin(result.user.role === 'admin');
    }
    return result;
  };

  const signup = async (name, email, password) => {
    return await authService.signup(name, email, password);
  };

  const verifyOTP = async (email, otp) => {
    return await authService.verifyOTP(email, otp);
  };

  const resendVerification = async (email) => {
    return await authService.resendVerification(email);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAdmin(false);
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const resetPassword = async (email, otp, newPassword) => {
    return await authService.resetPassword(email, otp, newPassword);
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await authService.changePassword(currentPassword, newPassword);
  };

  const value = {
    user,
    isAdmin,
    isLoading,
    error,
    login,
    signup,
    verifyOTP,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword,
    logout,
    isAuthenticated: authService.isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ THIS IS THE EXPORT YOU NEED
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};