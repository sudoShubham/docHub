import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import CompanyLogo from "../images/Waynautic.png";
import { API_BASE_URL } from "../config";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login/`, {
        email: username,
        password: password,
      });
      const { access_token, user } = response.data;
      sessionStorage.setItem("authToken", access_token);
      sessionStorage.setItem("userDetails", JSON.stringify(user));
      navigate("/home");
    } catch (error) {
      console.error("Login failed", error);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-green-200 p-4">
      <div className="flex flex-col md:flex-row w-full max-w-screen-lg bg-white shadow-2xl rounded-lg">
        {/* Left side with company logo and message */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center">
          <Link
            to="https://waynautic.com/"
            target="_blank"
            className="flex items-center mb-4"
          >
            <img
              src={CompanyLogo}
              alt="Company Logo"
              className="max-h-16 w-auto object-contain"
            />
          </Link>
          <p className="text-xl text-gray-700 text-center mb-4">
            Welcome to Waynautic Hub! Your one-stop destination.
          </p>
          <p className="text-sm text-gray-500 text-center">
            Please log in to access your account and explore the features.
          </p>
        </div>

        {/* Right side with login form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 border-b-4 border-sky-400 pb-2">
            LOGIN
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 relative overflow-hidden group"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
