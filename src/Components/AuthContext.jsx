
import { createContext, useContext, useEffect, useState } from "react";
import authApi from "../Api/auth.api";

const ADMIN_VIEWING_USER_KEY = "admin_viewing_user_module";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [error, setError] = useState(null);

  // Admin viewing user module in read-only mode (persists in session)
  const [isAdminViewingUserModule, setIsAdminViewingUserModuleState] = useState(() => {
    try {
      return sessionStorage.getItem(ADMIN_VIEWING_USER_KEY) === "true";
    } catch {
      return false;
    }
  });

  const setIsAdminViewingUserModule = (value) => {
    try {
      if (value) {
        sessionStorage.setItem(ADMIN_VIEWING_USER_KEY, "true");
      } else {
        sessionStorage.removeItem(ADMIN_VIEWING_USER_KEY);
      }
      setIsAdminViewingUserModuleState(!!value);
    } catch {
      setIsAdminViewingUserModuleState(!!value);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");


      if (!token || !storedUser) {
        setLoading(false);
        setInitialLoadDone(true);
        return;
      }

      try {
        const cachedUser = JSON.parse(storedUser)
        setUser(cachedUser)
        setIsAdmin(cachedUser.role?.toUpperCase() === "ADMIN")
      } catch (error) {
        console.log("Failed to parse cached user", error);
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
        setInitialLoadDone(true)
        return
      }

      try {
        const profile = await authApi.getProfile();
        setUser(profile);
        setIsAdmin(profile.role?.toUpperCase() === "ADMIN");
        localStorage.setItem("user", JSON.stringify(profile))
      } catch (error) {
        console.error("Profile refresh failed:", error);
        if (!localStorage.getItem("access_token")) {
          setUser(null);
          setIsAdmin(false);
          setIsAdminViewingUserModuleState(false);
        }
      } finally {
        setLoading(false);
        setInitialLoadDone(true);
      }
    };

    loadUser();
  }, []);

  // Listen for session-expired events from API interceptors
  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAdmin(false);
      setIsAdminViewingUserModuleState(false);
    };
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, []);

  const login = async (email, password, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authApi.login(email, password);
      setLoading(false);

      if (!result?.success) {
        setError(result?.message || "Wrong password or email address");
        return { success: false, message: result?.message || "Wrong password or email address" };
      }

      const isAdminUser = result.user?.role?.toUpperCase() === "ADMIN";
      if (isAdminUser && options.source === "user") {
        setIsAdminViewingUserModule(true);
      }

      localStorage.setItem("user", JSON.stringify(result.user));
      setUser(result.user);
      setIsAdmin(isAdminUser);
      return result;
    } catch (err) {
      setLoading(false);
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || "Wrong password or email address";
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const forgotPassword = (email) => authApi.forgotPassword(email);
  const resetPassword = (email, otp, newPassword) =>
    authApi.resetPassword(email, otp, newPassword);
  const resendVerification = (email) =>
    authApi.resendVerification(email);


  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    try {
      sessionStorage.removeItem(ADMIN_VIEWING_USER_KEY);
    } catch { }
    setUser(null);
    setIsAdmin(false);
    setIsAdminViewingUserModuleState(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        isLoading: loading,
        error,
        isAdminViewingUserModule,
        setIsAdminViewingUserModule,
        login,
        signup: authApi.signup,
        verifyOTP: authApi.verifyOTP,
        forgotPassword,
        resetPassword,
        resendVerification,
        logout,
      }}
    >
      {initialLoadDone && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
