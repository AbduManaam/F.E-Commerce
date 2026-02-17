

import React, { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useAuth } from "./AuthContext"

const Login = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  })

  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [isOtpStep, setIsOtpStep] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const {
    login,
    signup,
    verifyOTP,
    user,
    isAdmin,
    error,
    loading,
  } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"

  /* ================================
     🔁 Auto Redirect
  ================================= */
  useEffect(() => {
    if (user) {
      navigate(isAdmin ? "/admindash" : from, { replace: true })
    }
  }, [user, isAdmin, navigate, from])

  /* ================================
     ⏱ OTP Timer
  ================================= */
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(t => t - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  /* ================================
     🔄 Input Change
  ================================= */
  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: name === "otp"
        ? value.replace(/\D/g, "")
        : value,
    }))

    setErrors(prev => ({ ...prev, [name]: "" }))
  }

  /* ================================
     🧠 VALIDATION LOGIC
  ================================= */
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    return regex.test(email)
  }

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)
  }

  /* ================================
     🔐 LOGIN
  ================================= */
  const handleLogin = async (e) => {
    e.preventDefault()
    const email = formData.email.trim()
    const password = formData.password.trim()

    const newErrors = {}

    if (!email) newErrors.email = "Email is required"
    else if (!validateEmail(email))
      newErrors.email = "Enter a valid email address"

    if (!password) newErrors.password = "Password is required"
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await login(email, password)
    } catch (err) {
      console.error(err)
    }
  }

  /* ================================
     🆕 SIGNUP
  ================================= */
  const handleSignup = async (e) => {
    e.preventDefault()

    const name = formData.name.trim()
    const email = formData.email.trim()
    const password = formData.password.trim()
    const confirmPassword = formData.confirmPassword.trim()

    const newErrors = {}

    if (!name) newErrors.name = "Full name is required"

    if (!email) newErrors.email = "Email is required"
    else if (!validateEmail(email))
      newErrors.email = "Enter a valid email address"

    if (!password)
      newErrors.password = "Password is required"
    else if (!validatePassword(password))
      newErrors.password =
        "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"

    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const result = await signup(name, email, password)

    if (result?.success) {
      setSuccess(result.message)
      setIsOtpStep(true)
      setResendTimer(60)
      setFormData(prev => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }))
    }
  }

  /* ================================
     🔢 OTP VERIFY
  ================================= */
  const handleOtpVerification = async (e) => {
    e.preventDefault()

    if (formData.otp.length !== 6) {
      setErrors({ otp: "OTP must be 6 digits" })
      return
    }

    const result = await verifyOTP(formData.email, formData.otp)

    if (result?.success) {
      setSuccess("Email verified successfully. Please login.")
      setIsOtpStep(false)
      setIsSignup(false)
      setFormData(prev => ({ ...prev, otp: "" }))
    }
  }

  /* ================================
     🎨 INPUT UI
  ================================= */
  const renderInput = (name, type, placeholder) => (
    <>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        className={`w-full border px-3 py-2 mb-1 ${
          errors[name] ? "border-red-500" : ""
        }`}
        disabled={loading}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm mb-2">{errors[name]}</p>
      )}
    </>
  )

  /* ================================
     OTP SCREEN
  ================================= */
  if (isOtpStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
          <h2 className="text-2xl font-bold text-center mb-4">
            Verify Your Email
          </h2>

          {renderInput("otp", "text", "Enter 6-digit OTP")}

          <button
            onClick={handleOtpVerification}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded mt-2"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </div>
    )
  }

  /* ================================
     LOGIN / SIGNUP
  ================================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-center mb-4">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        <form onSubmit={isSignup ? handleSignup : handleLogin}>
          {isSignup && renderInput("name", "text", "Full Name")}
          {renderInput("email", "email", "Email")}
          {renderInput("password", "password", "Password")}
          {isSignup &&
            renderInput("confirmPassword", "password", "Confirm Password")}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded mt-2"
          >
            {loading
              ? "Processing..."
              : isSignup
              ? "Sign Up"
              : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => {
              setIsSignup(!isSignup)
              setErrors({})
              setSuccess("")
            }}
            className="text-sm text-indigo-600"
          >
            {isSignup
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>

        {!isSignup && (
          <div className="text-center mt-2">
            <Link to="/forgot-password" className="text-sm text-indigo-600">
              Forgot password?
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
