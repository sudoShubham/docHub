import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const AdminPage = () => {
  const navigate = useNavigate();

  const handleClickViewFiles = () => {
    navigate("/admin-documents"); // Navigate to AdminDocumentsPage
  };

  const handleClickAddUser = () => {
    navigate("/signup"); // Navigate to the Signup page
  };

  const handleClickAllUsers = () => {
    navigate("/all-users"); // Navigate to the Signup page
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6 md:p-12">
        <div className="bg-white shadow-sm rounded-lg p-8 space-y-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Admin Dashboard
          </h1>
          <p className="text-center text-gray-600">
            Welcome to the Admin Dashboard. You can manage and view all user
            document files here.
          </p>
          <div className="flex justify-center space-x-4">
            {/* Button to View Users' Files */}
            <button
              onClick={handleClickViewFiles}
              className="bg-blue-600 text-white text-lg py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transform transition-all duration-300 ease-in-out hover:scale-105"
            >
              View Users' Files
            </button>

            {/* Button to see all User */}
            <button
              onClick={handleClickAllUsers}
              className="bg-blue-600 text-white text-lg py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transform transition-all duration-300 ease-in-out hover:scale-105"
            >
              See All Users
            </button>

            {/* Button to Add New User */}
            <button
              onClick={handleClickAddUser}
              className="bg-green-600 text-white text-lg py-3 px-6 rounded-lg shadow-md hover:bg-green-700 transform transition-all duration-300 ease-in-out hover:scale-105"
            >
              Add New User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
