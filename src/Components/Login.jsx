

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./AuthContext";

export default function Login() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const { user, login, logout } = useAuth(); // use global auth
  const navigate = useNavigate();
  const API_URL = "http://localhost:5000/users";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { name, email, password, confirmPassword } = formData;

    if (!email || !password || (isSignup && (!name || !confirmPassword))) {
      setError("Please fill in all required fields");
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      if (isSignup) {
        const existing = await axios.get(`${API_URL}?email=${email}`);
        if (existing.data.length > 0) {
          setError("User already exists");
          return;
        }

        const newUser = { name, email, password, cart: [] };
        const res = await axios.post(API_URL, newUser);

        login(res.data); // ✅ set global state
        navigate("/");
      } else {
        const res = await axios.get(`${API_URL}?email=${email}`);
        const foundUser = res.data[0];

        if (!foundUser) {
          setError("User not found");
          return;
        }
        if (foundUser.password !== password) {
          setError("Incorrect password");
          return;
        }

        login(foundUser); // ✅ set global state
        navigate("/");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white text-gray-500 max-w-96 mx-4 md:p-6 p-4 text-left text-sm rounded-xl shadow-[0px_0px_10px_0px] shadow-black/10">
        {!user ? (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
              {isSignup ? "Create Account" : "Welcome back"}
            </h2>
            <form onSubmit={handleSubmit}>
              {isSignup && (
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border my-3 border-gray-500/30 rounded-full py-2.5 px-4"
                  type="text"
                  placeholder="Enter your name"
                  required
                />
              )}
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border my-3 border-gray-500/30 rounded-full py-2.5 px-4"
                type="email"
                placeholder="Enter your email"
                required
              />
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border mt-1 border-gray-500/30 rounded-full py-2.5 px-4"
                type="password"
                placeholder="Enter your password"
                required
              />
              {isSignup && (
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border mt-3 border-gray-500/30 rounded-full py-2.5 px-4"
                  type="password"
                  placeholder="Confirm your password"
                  required
                />
              )}
              {error && (
                <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
              )}
              <button
                type="submit"
                className="w-full mt-5 bg-indigo-500 py-2.5 rounded-full text-white"
              >
                {isSignup ? "Sign Up" : "Log in"}
              </button>
            </form>
            <p className="text-center mt-4">
              {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-blue-500 underline"
              >
                {isSignup ? "Login" : "Signup"}
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
              Hello, {user.name || user.email}
            </h2>
            <button
              onClick={logout}
              className="w-full bg-red-500 py-2.5 rounded-full text-white"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
