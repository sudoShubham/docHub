import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const AdminPage = () => {
  const navigate = useNavigate();

  const handleClickViewFiles = () => {
    navigate("/admin-documents");
  };

  const handleClickAddUser = () => {
    navigate("/signup");
  };

  const handleClickAllUsers = () => {
    navigate("/all-users");
  };

  const handleExportData = () => {
    navigate("/export-data");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6 md:p-12">
        <div className="bg-white rounded-lg p-8 space-y-8 md:space-y-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
            Admin Dashboard
          </h1>
          <p className="text-center text-gray-600 text-lg md:text-xl">
            Welcome to the Admin Dashboard. You can manage and view all user
            document files here.
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Button to View Users' Files */}
            <button
              onClick={handleClickViewFiles}
              className="bg-gradient-to-r from-blue-500 to-sky-400 text-white text-lg py-3 px-8 rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none"
            >
              View Users' Files
            </button>

            {/* Button to See All Users */}
            <button
              onClick={handleClickAllUsers}
              className="bg-gradient-to-r from-blue-500 to-sky-400 text-white text-lg py-3 px-8 rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none"
            >
              See All Users
            </button>

            {/* Button to Export Data*/}
            <button
              onClick={handleExportData}
              className="bg-gradient-to-r from-blue-500 to-sky-400 text-white text-lg py-3 px-8 rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none"
            >
              Export Data
            </button>

            {/* Button to Add New User */}
            <button
              onClick={handleClickAddUser}
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white text-lg py-3 px-8 rounded-full shadow-lg hover:from-green-600 hover:to-teal-700 transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none"
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
