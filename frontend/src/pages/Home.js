import React from "react";
import Navbar from "../components/Navbar";
import CompanyLogo from "../images/WaynauticLogo.png"; // Ensure to import your logo image here
import { Link } from "react-router-dom";

const Home = () => {
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));

  return (
    <div className="bg-white min-h-screen overflow-x-hidden font-sans">
      <Navbar />

      <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between space-y-12 md:space-y-0">
        {/* Left Section - Company Logo and Welcome Message */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/2 text-center md:text-left">
          <img
            src={CompanyLogo}
            alt="Company Logo"
            className="h-28 mb-6 object-contain mx-auto md:mx-0" // Center the logo on mobile
          />
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            Welcome {userDetails.first_name} to Waynautic Hub!
          </h1>
          <p className="text-lg text-gray-700 max-w-md">
            Your one-stop destination for managing documents, agreements, and
            more. We're here to simplify your work and keep everything in one
            place.
          </p>
        </div>

        {/* Right Section - Features */}
        <div className="w-full md:w-1/2 mt-8 md:mt-0">
          <div className="bg-white shadow-lg rounded-xl p-8 space-y-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              Explore Our Features
            </h2>

            <hr className="border-t-2 border-gray-200 mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature 1 */}
              <Link
                to="/my-documents"
                className="bg-white rounded-xl shadow-md p-6 transition duration-300 ease-in-out hover:shadow-xl hover:transform hover:scale-105"
              >
                <h3 className="text-xl font-semibold text-blue-500 mb-2">
                  My Documents
                </h3>
                <p className="text-gray-600">
                  Upload, manage, and access your documents securely from
                  anywhere.
                </p>
              </Link>

              {/* Feature 2 */}
              <Link
                to="/agreements"
                className="bg-white rounded-xl shadow-md p-6 transition duration-300 ease-in-out hover:shadow-xl hover:transform hover:scale-105"
              >
                <h3 className="text-xl font-semibold text-blue-500 mb-2">
                  Agreements
                </h3>
                <p className="text-gray-600">
                  View and manage all your agreements in one centralized
                  location.
                </p>
              </Link>

              {/* Feature 3 */}
              <Link
                to="/my-profile"
                className="bg-white rounded-xl shadow-md p-6 transition duration-300 ease-in-out hover:shadow-xl hover:transform hover:scale-105"
              >
                <h3 className="text-xl font-semibold text-blue-500 mb-2">
                  Profile
                </h3>
                <p className="text-gray-600">
                  Keep your profile up-to-date and manage account settings
                  easily.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-12 text-center py-6 bg-gray-100">
        <p className="text-sm text-gray-500">
          © 2024 Waynautic Hub. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Home;
