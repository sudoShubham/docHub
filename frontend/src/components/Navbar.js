import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CompanyLogo from "../images/Waynautic.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle menu visibility
  const navigate = useNavigate();

  const handleSignOut = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userDetails");
    navigate("/"); // Redirect to the login page
  };

  return (
    <nav className="bg-white-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Company logo */}
        <Link
          to="https://waynautic.com/"
          className="flex items-center space-x-2"
          target="_blank"
        >
          <img src={CompanyLogo} alt="Company Logo" className="h-12" />
        </Link>

        {/* Hamburger Icon for Mobile */}
        <button
          className="lg:hidden text-black focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle the menu on click
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Navigation links */}
        <div
          className={`lg:flex space-x-6 ${
            isMenuOpen ? "flex-col mt-4 w-full" : "hidden lg:flex"
          }`}
        >
          <Link to="/dashboard" className="text-black hover:text-blue-600 py-2">
            Dashboard
          </Link>
          <Link
            to="/my-documents"
            className="text-black hover:text-blue-600 py-2"
          >
            My Documents
          </Link>
          <Link
            to="/agreements"
            className="text-black hover:text-blue-600 py-2"
          >
            Agreements
          </Link>
          <Link
            to="/my-profile"
            className="text-black hover:text-blue-600 py-2"
          >
            My Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="text-black hover:text-blue-600 py-2"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
