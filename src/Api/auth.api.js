import goApi from "./Api";

const authApi = {
  // LOGIN
  async login(email, password) {
    try {
      const res = await goApi.post("/auth/login", { email, password });
      const { access_token, user } = res.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          error.message ||       
         "Invalid email or password",
      };
    }
  },

  // SIGNUP
  async signup(name, email, password) {
    try {
      const res = await goApi.post("/auth/signup", {
        name,
        email,
        password,
      });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Signup failed",
      };
    }
  },

  // 🔢 VERIFY OTP (signup)
  async verifyOTP(email, otp) {
    try {
      const res = await goApi.post("/auth/verify-otp", { email, otp });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "OTP verification failed",
      };
    }
  },

  // 🔐 FORGOT PASSWORD (send OTP)
  async forgotPassword(email) {
    try {
      const res = await goApi.post("/auth/forgot-password", { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to send reset OTP",
      };
    }
  },

 // 🔁 RESET PASSWORD WITH OTP (FIXED)
async resetPassword(email, otp, newPassword) {
  try {
    const res = await goApi.post("/auth/reset-password", {
      email,
      otp,
      new_password: newPassword, // ✅ EXACT BACKEND KEY
    });

    return { success: true, message: res.data.message };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Password reset failed",
    };
  }
},


  // 🔄 RESEND OTP
  async resendVerification(email) {
    try {
      const res = await goApi.post("/auth/resend-verification", { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to resend OTP",
      };
    }
  },

  // 👤 PROFILE
  async getProfile() {
    const res = await goApi.get("/user/profile");
    return res.data;
  },

  // LOGOUT
 async logout() {
  try {
    await goApi.post("/auth/logout");
  } catch (error) {
    // optional: log error
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  }
}

};

export default authApi;
