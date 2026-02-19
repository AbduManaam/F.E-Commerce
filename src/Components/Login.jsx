import React, { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useAuth } from "./AuthContext"
import { Eye, EyeOff, Mail, Lock, User, ShieldCheck } from "lucide-react"

// ✅ OUTSIDE Login component — prevents remount on every render
const InputField = ({ name, type = "text", placeholder, icon: Icon, showToggle, onToggle, show, value, onChange, error, disabled }) => (
  <div className="mb-4">
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        name={name}
        type={showToggle ? (show ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete="off"
        className={`w-full ${Icon ? "pl-10" : "pl-4"} ${showToggle ? "pr-10" : "pr-4"} py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 transition-all outline-none focus:border-amber-500 ${
          error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"
        }`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
    {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
  </div>
)

const Login = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  })

  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [isOtpStep, setIsOtpStep] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { login, signup, verifyOTP, user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"

  useEffect(() => {
    if (user) {
      navigate(isAdmin ? "/admindash" : from, { replace: true })
    }
  }, [user, isAdmin, navigate, from])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(t => t - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "otp" ? value.replace(/\D/g, "") : value,
    }))
    setErrors(prev => ({ ...prev, [name]: "" }))
    setGlobalError("")
  }

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)

  // ── LOGIN ──
  const handleLogin = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setGlobalError("")

    const email = formData.email.trim()
    const password = formData.password.trim()
    const newErrors = {}

    if (!email) newErrors.email = "Email is required"
    else if (!validateEmail(email)) newErrors.email = "Enter a valid email address"
    if (!password) newErrors.password = "Password is required"
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const result = await login(email, password)
      if (!result?.success) {
        setGlobalError(result?.message || "Invalid email or password")
      }
    } catch (err) {
      setGlobalError("Invalid email or password")
    }
  }

  // ── SIGNUP ──
  const handleSignup = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setGlobalError("")

    const name = formData.name.trim()
    const email = formData.email.trim()
    const password = formData.password.trim()
    const confirmPassword = formData.confirmPassword.trim()
    const newErrors = {}

    if (!name) newErrors.name = "Full name is required"
    if (!email) newErrors.email = "Email is required"
    else if (!validateEmail(email)) newErrors.email = "Enter a valid email address"
    if (!password) newErrors.password = "Password is required"
    else if (!validatePassword(password))
      newErrors.password = "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const result = await signup(name, email, password)
    if (result?.success) {
      setSuccess(result.message)
      setIsOtpStep(true)
      setResendTimer(60)
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }))
    } else {
      setGlobalError(result?.message || "Signup failed")
    }
  }

  // ── OTP ──
  const handleOtpVerification = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (formData.otp.length !== 6) {
      setErrors({ otp: "OTP must be 6 digits" })
      return
    }
    const result = await verifyOTP(formData.email, formData.otp)
    if (result?.success) {
      setSuccess("Email verified! Please login.")
      setIsOtpStep(false)
      setIsSignup(false)
      setFormData(prev => ({ ...prev, otp: "" }))
    } else {
      setErrors({ otp: result?.message || "Invalid OTP" })
    }
  }

  // ── OTP SCREEN ──
  if (isOtpStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
              <p className="text-gray-500 text-sm mt-1">
                Enter the 6-digit code sent to{" "}
                <span className="font-medium text-amber-600">{formData.email}</span>
              </p>
            </div>

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm text-center">
                {success}
              </div>
            )}

            <form onSubmit={handleOtpVerification} noValidate>
              <div className="mb-4">
                <input
                  name="otp"
                  type="text"
                  placeholder="• • • • • •"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-center text-2xl tracking-widest font-bold outline-none transition-all ${
                    errors.otp
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-gray-50 focus:border-amber-500"
                  }`}
                />
                {errors.otp && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{errors.otp}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>

            <div className="text-center mt-4">
              {resendTimer > 0 ? (
                <p className="text-gray-500 text-sm">
                  Resend OTP in{" "}
                  <span className="font-semibold text-amber-600">{resendTimer}s</span>
                </p>
              ) : (
                <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── LOGIN / SIGNUP ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">🍽️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isSignup
                ? "Join Yumzy and start ordering!"
                : "Sign in to your Yumzy account"}
            </p>
          </div>

          {/* Global Error Banner */}
          {globalError && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center font-medium">
              ⚠️ {globalError}
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="mb-5 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm text-center">
              ✅ {success}
            </div>
          )}

          <form onSubmit={isSignup ? handleSignup : handleLogin} noValidate>
            {isSignup && (
              <InputField
                name="name"
                type="text"
                placeholder="Full Name"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                disabled={loading}
              />
            )}

            <InputField
              name="email"
              type="email"
              placeholder="Email Address"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={loading}
            />

            <InputField
              name="password"
              placeholder="Password"
              icon={Lock}
              showToggle
              show={showPassword}
              onToggle={() => setShowPassword(p => !p)}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              disabled={loading}
            />

            {isSignup && (
              <InputField
                name="confirmPassword"
                placeholder="Confirm Password"
                icon={Lock}
                showToggle
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(p => !p)}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                disabled={loading}
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 mt-2"
            >
              {loading
                ? "Processing..."
                : isSignup
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="text-center mt-5">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup)
                setErrors({})
                setGlobalError("")
                setSuccess("")
              }}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              {isSignup
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Forgot Password */}
          {!isSignup && (
            <div className="text-center mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-500 hover:text-amber-600 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login