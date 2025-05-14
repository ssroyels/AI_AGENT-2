import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../context/user.context";
import LoginIllustration from '../assets/Mobile login-rafiki.svg';

const Login = () => {
  // For dev
const BASE_URL = import.meta.env.VITE_API_URL ? "http://localhost:5000" : "https://your-backend.onrender.com";

// Usage


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("")
  const navigate = useNavigate();

  const SubmitHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    axios.post(`${BASE_URL}/users/login`, { email, password })
      .then((res) => {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setEmail("");
        setPassword("");
        navigate("/");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Login failed. Try again.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Illustration */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-400 to-blue-600 justify-center items-center">
        <img
          src={LoginIllustration} 
          alt="Login Illustration"
          className="w-3/4 max-w-md"
        />
      </div>

      {/* Login Form */}
      <div className="flex flex-1 justify-center items-center bg-white p-6">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">Welcome Back 👋</h2>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <form className="space-y-4" onSubmit={SubmitHandler}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox text-blue-600" />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-200 flex justify-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600">
            Don't have an account?
            <a href="/register" className="text-blue-600 hover:underline ml-1">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
