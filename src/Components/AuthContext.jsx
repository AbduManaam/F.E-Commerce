
import { createContext, useContext, useEffect, useState } from "react";
import authApi from "../Api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");


      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

     try{
        const cachedUser= JSON.parse(storedUser)
        setUser(cachedUser)
        setIsAdmin(cachedUser.role === "admin")
        setLoading(false)
     }catch (error){
        console.log("Failed to parse cached user",error);
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
        return
     }

      try {
        const profile = await authApi.getProfile();
        setUser(profile);
        setIsAdmin(profile.role === "admin");
        localStorage.setItem("user",JSON.stringify(profile))
      } catch (error) {
        console.error("Profile refresh failed:", error);
        // Only clear state if the token was actually removed (e.g. by Api.jsx 401 interceptor)
        if (!localStorage.getItem("access_token")) {
           setUser(null);
           setIsAdmin(false);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    const result = await authApi.login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return result;
    }

    localStorage.setItem("user", JSON.stringify(result.user));
    setUser(result.user);
    setIsAdmin(result.user.role === "admin");
    return result;
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
  setUser(null);
  setIsAdmin(false);
};

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        error,
        login,
        signup: authApi.signup,
        verifyOTP: authApi.verifyOTP,
        forgotPassword,
        resetPassword,
        resendVerification,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
