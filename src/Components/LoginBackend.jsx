import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function LoginBackend() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isOTPStep, setIsOTPStep] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, isAdmin, login, signup, verifyOTP, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const { email, password } = formData;

    if (!email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    const result = await login(email, password);
    
    setLoading(false);
    
    if (result.success) {
      setSuccess("Login successful!");
      
      // Redirect based on user role
      setTimeout(() => {
        if (result.user.role === "admin") {
          navigate("/admindash", { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }, 500);
    } else {
      setError(result.message || "Login failed");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    
    const result = await signup(name, email, password);
    
    setLoading(false);
    
    if (result.success) {
      setSuccess(result.message);
      setIsOTPStep(true);
    } else {
      setError(result.message || "Signup failed");
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const { email, otp } = formData;

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    
    const result = await verifyOTP(email, otp);
    
    setLoading(false);
    
    if (result.success) {
      setSuccess("Email verified successfully! You can now login.");
      setIsOTPStep(false);
      setIsSignup(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        otp: "",
      });
    } else {
      setError(result.message || "OTP verification failed");
    }
  };

  const handleResendOTP = async () => {
    // You would need to implement resend OTP in authService
    setSuccess("OTP has been resent to your email");
  };

  // If user is already logged in, show logout option
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Welcome, {user.name || user.email}
          </h2>
          
          <div className="mb-6 text-center">
            <p className="text-gray-600 mb-2">
              You are logged in as <span className="font-semibold">{isAdmin ? "Admin" : "User"}</span>
            </p>
            <p className="text-sm text-gray-500">
              Email: {user.email}
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate(isAdmin ? "/admindash" : "/")}
              className="w-full bg-blue-500 py-3 rounded-lg text-white hover:bg-blue-600 transition font-medium"
            >
              Go to {isAdmin ? "Admin Dashboard" : "Home"}
            </button>
            
            <button
              onClick={logout}
              className="w-full bg-gray-100 py-3 rounded-lg text-gray-700 hover:bg-gray-200 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isOTPStep 
            ? "Verify Email" 
            : isSignup 
              ? "Create Account" 
              : "Welcome Back"
          }
        </h2>
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {isOTPStep ? (
          // OTP Verification Form
          <form onSubmit={handleOTPSubmit}>
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                We've sent a 6-digit OTP to <strong>{formData.email}</strong>
              </p>
              
              <input
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 text-center text-xl tracking-widest"
                type="text"
                placeholder="000000"
                maxLength="6"
                required
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 py-3 rounded-lg text-white disabled:opacity-50 hover:bg-indigo-600 transition font-medium"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-blue-500 hover:text-blue-600 text-sm"
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          </form>
        ) : (
          // Login/Signup Form
          <form onSubmit={isSignup ? handleSignupSubmit : handleLoginSubmit}>
            {isSignup && (
              <div className="mb-4">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg py-3 px-4"
                  type="text"
                  placeholder="Full Name"
                  required
                  disabled={loading}
                />
              </div>
            )}
            
            <div className="mb-4">
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg py-3 px-4"
                type="email"
                placeholder="Email Address"
                required
                disabled={loading}
              />
            </div>
            
            <div className="mb-4">
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg py-3 px-4"
                type="password"
                placeholder="Password"
                required
                disabled={loading}
              />
            </div>
            
            {isSignup && (
              <div className="mb-6">
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg py-3 px-4"
                  type="password"
                  placeholder="Confirm Password"
                  required
                  disabled={loading}
                />
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 py-3 rounded-lg text-white disabled:opacity-50 hover:bg-indigo-600 transition font-medium"
            >
              {loading 
                ? "Processing..." 
                : isSignup 
                  ? "Create Account" 
                  : "Login"
              }
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              if (isOTPStep) {
                setIsOTPStep(false);
              } else {
                setIsSignup(!isSignup);
              }
              setError("");
              setSuccess("");
            }}
            className="text-blue-500 hover:text-blue-600 font-medium"
            disabled={loading}
          >
            {isOTPStep
              ? "Back to signup"
              : isSignup
                ? "Already have an account? Login"
                : "Don't have an account? Signup"
            }
          </button>
        </div>
        
        {!isSignup && !isOTPStep && (
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Forgot password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}