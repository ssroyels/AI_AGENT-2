import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";
import LoginIllustration from "../assets/Mobile login-rafiki.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  /* -------------------------------------------------------------------------- */
  /* REDIRECT AFTER LOGIN */
  /* -------------------------------------------------------------------------- */
  const from = location.state?.from?.pathname || "/";

  /* -------------------------------------------------------------------------- */
  /* LOAD REMEMBERED EMAIL */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const savedEmail = localStorage.getItem("remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  /* -------------------------------------------------------------------------- */
  /* SUBMIT */
  /* -------------------------------------------------------------------------- */
  const SubmitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      return setError("Email and password are required");
    }

    if (!email.includes("@")) {
      return setError("Enter a valid email address");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "/users/login",
        { email: email.trim(), password },
        { withCredentials: true }
      );

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      if (rememberMe) {
        localStorage.setItem("remember_email", email);
      } else {
        localStorage.removeItem("remember_email");
      }

      setEmail("");
      setPassword("");

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ILLUSTRATION */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-400 to-blue-600 justify-center items-center">
        <img
          src={LoginIllustration}
          alt="Login"
          className="w-3/4 max-w-md"
        />
      </div>

      {/* FORM */}
      <div className="flex flex-1 justify-center items-center bg-white p-6">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Welcome Back 👋
          </h2>

          {error && (
            <p className="text-red-600 text-sm text-center">
              {error}
            </p>
          )}

          <form className="space-y-4" onSubmit={SubmitHandler}>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-sm text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-gray-600">Remember me</span>
              </label>

              <span className="text-blue-600 cursor-pointer hover:underline">
                Forgot password?
              </span>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-xl flex justify-center"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600">
            Don’t have an account?
            <Link
              to="/register"
              className="text-blue-600 hover:underline ml-1"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
