import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Make sure this is imported
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSignUp = (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");

    // Construct the payload
    const payload = {
      email,
      username: email, // Assuming username is same as email
      first_name: firstName,
      last_name: lastName,
      password,
      confirm_password: confirmPassword,
    };

    // Call the API for sign up
    axios
      .post(`${API_BASE_URL}/api/users/register/`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log("User signed up successfully:", response.data);
        setSuccess("Sign-up successful! Please log in.");

        // Redirect to the login page after successful sign-up
        setTimeout(() => {
          navigate("/login"); // Navigate to /login page
        }, 1500); // 1.5 second delay to show success message
      })
      .catch((error) => {
        console.error(
          "Sign-up error:",
          error.response ? error.response.data : error.message
        );
        setError("An error occurred during sign-up. Please try again.");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-green-200 p-6 sm:p-10">
      <div className="bg-white p-8 md:p-10 lg:p-12 rounded-lg shadow-xl w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-12">
          Join Waynautics and get started!
        </p>
        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                placeholder="First Name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 shadow-sm"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                placeholder="Last Name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 shadow-sm"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Waynautics Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@waynautics.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Create a password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 shadow-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-200"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-500 hover:text-green-700 font-semibold"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
