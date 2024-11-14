import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate(); // Use useNavigate for redirection

  const handleSignOut = () => {
    // Implement your sign out logic here
    // For example, you can clear any authentication data (tokens, session)
    sessionStorage.removeItem("authToken"); // Remove auth token from localStorage
    sessionStorage.removeItem("userDetails");

    navigate("/"); // Redirect to the login page
  };

  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          DocHub
        </Link>
        <div className="space-x-6">
          <Link to="/dashboard" className="text-white hover:text-gray-300">
            Dashboard
          </Link>
          <Link to="/my-documents" className="text-white hover:text-gray-300">
            My Documents
          </Link>
          <Link to="/my-profile" className="text-white hover:text-gray-300">
            My Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="text-white hover:text-gray-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
