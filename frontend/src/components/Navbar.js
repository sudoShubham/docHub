import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CompanyLogo from "../images/Waynautic.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Retrieve user details from sessionStorage
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const isStaff = userDetails?.is_staff;

  const handleSignOut = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userDetails");
    navigate("/"); // Redirect to the login page
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Company logo */}
        <Link
          to="https://waynautic.com/"
          className="flex items-center"
          target="_blank"
        >
          <img src={CompanyLogo} alt="Company Logo" className="h-12" />
        </Link>

        {/* Hamburger Icon for Mobile */}
        <button
          className="lg:hidden text-black focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
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

        {/* Navigation links for desktop */}
        <div className="hidden lg:flex space-x-6">
          <Link to="/home" className="text-black hover:text-blue-600 py-2">
            Home
          </Link>
          <Link to="/dashboard" className="text-black hover:text-blue-600 py-2">
            Upload Documents
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
          {isStaff && (
            <Link to="/admin" className="text-black hover:text-blue-600 py-2 ">
              Admin
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="text-black hover:text-red-600 py-2"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-50 shadow-inner">
          <div className="flex flex-col items-start space-y-2 p-4">
            <Link to="/home" className="text-black hover:text-blue-600 py-2">
              Home
            </Link>
            <Link
              to="/dashboard"
              className="text-black hover:text-blue-600 w-full text-left py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Upload Documents
            </Link>
            <Link
              to="/my-documents"
              className="text-black hover:text-blue-600 w-full text-left py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              My Documents
            </Link>
            <Link
              to="/agreements"
              className="text-black hover:text-blue-600 w-full text-left py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Agreements
            </Link>
            <Link
              to="/my-profile"
              className="text-black hover:text-blue-600 w-full text-left py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              My Profile
            </Link>
            {isStaff && (
              <Link
                to="/admin"
                className="text-black hover:text-blue-600 w-full text-left py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => {
                handleSignOut();
                setIsMenuOpen(false);
              }}
              className="text-black hover:text-red-600 w-full text-left py-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
