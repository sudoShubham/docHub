import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Adjust path as necessary
import { Link } from "react-router-dom";

const MyProfile = () => {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
  });

  // Fetch user data from sessionStorage on component mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem("userDetails");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserDetails({
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
      });
    }
  }, []);

  const handleChangePassword = () => {
    alert("Redirecting to change password page...");
    // Implement redirection to the change password page here
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="pt-20 px-6 sm:px-12 lg:px-32">
        <div className="bg-white p-10 rounded-2xl shadow-xl mx-auto max-w-3xl">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
            My Profile
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Here you can view and manage your profile details.
          </p>

          <div className="space-y-6">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Name:</span>
              <span className="text-sm text-gray-600">{userDetails.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Email:</span>
              <span className="text-sm text-gray-600">{userDetails.email}</span>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleChangePassword}
              className="py-3 px-6 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Change Password
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/dashboard"
              className="text-sm text-blue-500 hover:text-blue-700 font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
