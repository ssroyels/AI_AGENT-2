import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import signupImage from "../assets/sk.jpg";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  /* -------------------------------------------------------------------------- */
  /* SUBMIT HANDLER */
  /* -------------------------------------------------------------------------- */
  const SubmitHandler = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      return setError("All fields are required");
    }

    if (!email.includes("@")) {
      return setError("Enter a valid email");
    }

    try {
      setLoading(true);

      await axios.post(
        "/users/register",
        {
          name: name.trim(),
          email: email.trim(),
          password,
        },
        { withCredentials: true }
      );

      setName("");
      setEmail("");
      setPassword("");

      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-100 p-4">

      {/* LEFT IMAGE */}
      <div className="hidden md:flex w-1/2 justify-center items-center p-6">
        <img
          src={signupImage}
          alt="Signup"
          className="max-w-full h-auto"
        />
      </div>

      {/* FORM */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Create Account
        </h2>

        {/* ERROR */}
        {error && (
          <p className="text-red-600 text-sm text-center">
            {error}
          </p>
        )}

        <form className="space-y-4" onSubmit={SubmitHandler}>

          {/* NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

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

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-xl"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Already registered?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
