import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Components/AuthContext"; 
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const { login, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, go to admin panel
  useEffect(() => {
    if (user && isAdmin) navigate("/admindash", { replace: true });
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setGlobalError("");
    setErrors({});

    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await login(email, password);
      console.log("Full result",result);
      console.log("user role result",result?.user);
      

      if (!result?.success) {
        setGlobalError(result?.message || "Invalid credentials");
        return;
      }

      // Check if the logged in user is actually admin
      const role = result?.user?.role || result?.user?.Role;
      console.log("Role",role);
      
      if (role !== "admin") {
        setGlobalError("Access denied. This login is for admins only.");
        // logout to clear the token since they're not admin
        return;
      }

      navigate("/admindash", { replace: true });
    } catch {
      setGlobalError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white">Admin Portal</h1>
            <p className="text-blue-200 text-sm mt-2">Yumzy Dashboard Access</p>
          </div>

          {/* Global Error */}
          {globalError && (
            <div className="mb-5 p-3 bg-red-500/20 border border-red-400/40 text-red-200 rounded-xl text-sm text-center font-medium">
              ⚠️ {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 w-5 h-5 pointer-events-none" />
                <input
                  type="email"
                  placeholder="Admin Email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); setGlobalError(""); }}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-blue-300 bg-white/10 border outline-none focus:border-blue-400 transition ${
                    errors.email ? "border-red-400" : "border-white/20"
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-300 text-xs mt-1 ml-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 w-5 h-5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Admin Password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); setGlobalError(""); }}
                  disabled={loading}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl text-white placeholder-blue-300 bg-white/10 border outline-none focus:border-blue-400 transition ${
                    errors.password ? "border-red-400" : "border-white/20"
                  }`}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-300 text-xs mt-1 ml-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-purple-500/30 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Verifying...
                </span>
              ) : "Access Admin Panel"}
            </button>
          </form>

          <p className="text-center text-blue-300/60 text-xs mt-6">
            🔒 Restricted area — authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;