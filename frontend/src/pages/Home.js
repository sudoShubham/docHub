import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const Home = () => {
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));

  return (
    <div className=" min-h-screen overflow-x-hidden font-sans">
      <Navbar />

      <div className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between space-y-12 md:space-y-0">
        {/* Left Section - Company Logo and Welcome Message */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Welcome {userDetails.first_name} to Waynautic Hub!
          </h1>

          <p className="text-lg text-gray-700 max-w-md">
            Your one-stop destination for managing documents, agreements, and
            more. We’re here to simplify your work and keep everything in one
            place.
          </p>
        </div>

        {/* Right Section - Features */}
        <div className="w-full md:w-1/2 mt-8 md:mt-0 relative">
          <div className="absolute inset-0 bg-cover bg-center opacity-50 rounded-xl"></div>{" "}
          {/* Optional background for blur */}
          <div className="relative z-10 backdrop-blur-xl bg-white/60 rounded-xl p-10 space-y-10">
            <h2 className="text-4xl font-semibold text-gray-800 mb-6">
              Explore Our Features
            </h2>

            <hr className="border-t-4 border-sky-300 mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <Link
                to="/my-profile"
                className="bg-white rounded-xl shadow-lg p-6 transition-transform transform hover:scale-105 hover:shadow-2xl hover:translate-y-1 ease-in-out duration-300"
              >
                <h3 className="text-xl font-semibold text-sky-600 mb-2">
                  Profile
                </h3>
                <p className="text-gray-600">
                  Keep your profile up-to-date and manage account settings
                  easily.
                </p>
              </Link>
              {/* Feature 2 */}
              <Link
                to="/my-documents"
                className="bg-white rounded-xl shadow-lg p-6 transition-transform transform hover:scale-105 hover:shadow-2xl hover:translate-y-1 ease-in-out duration-300"
              >
                <h3 className="text-xl font-semibold text-sky-600 mb-2">
                  My Documents
                </h3>
                <p className="text-gray-600">
                  Upload, manage, and access your documents securely from
                  anywhere.
                </p>
              </Link>

              {/* Feature 3 */}
              <Link
                to="/leaves"
                className="bg-white rounded-xl shadow-lg p-6 transition-transform transform hover:scale-105 hover:shadow-2xl hover:translate-y-1 ease-in-out duration-300"
              >
                <h3 className="text-xl font-semibold text-sky-600 mb-2">
                  My Leaves
                </h3>
                <p className="text-gray-600">Manage your leaves easily.</p>
              </Link>
              {/* Feature 4 */}
              <Link
                to="/holidays"
                className="bg-white rounded-xl shadow-lg p-6 transition-transform transform hover:scale-105 hover:shadow-2xl hover:translate-y-1 ease-in-out duration-300"
              >
                <h3 className="text-xl font-semibold text-sky-600 mb-2">
                  My Holidays
                </h3>
                <p className="text-gray-600">See Holidays calendar here.</p>
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
