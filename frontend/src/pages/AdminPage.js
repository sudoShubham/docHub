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

  const handleHolidayManager = () => {
    navigate("/holiday-manager");
  };

  const handleSalaryGeneration = () => {
    navigate("/salary-generation");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-6 md:p-12">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8 md:space-y-12">
          <h1 className="text-4xl font-bold text-gray-900 text-center">
            Admin Dashboard
          </h1>
          <p className="text-center text-gray-600 text-lg md:text-xl">
            Welcome to the Admin Dashboard. You can manage and view all user
            document files here.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Button to View Users' Files */}
            <button
              onClick={handleClickViewFiles}
              className="bg-blue-500 text-white text-lg py-4 px-8 rounded-lg shadow-xl hover:bg-blue-600 transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none"
            >
              View Users' Files
            </button>

            {/* Button to See All Users */}
            <button
              onClick={handleClickAllUsers}
              className="bg-blue-500 text-white text-lg py-4 px-8 rounded-lg shadow-xl hover:bg-blue-600 transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none"
            >
              See All Users
            </button>

            {/* Button to Export Data */}
            <button
              onClick={handleExportData}
              className="bg-blue-500 text-white text-lg py-4 px-8 rounded-lg shadow-xl hover:bg-blue-600 transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none"
            >
              Export Data
            </button>

            {/* Button to Manage Holidays */}
            <button
              onClick={handleHolidayManager}
              className="bg-blue-500 text-white text-lg py-4 px-8 rounded-lg shadow-xl hover:bg-blue-600 transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none"
            >
              Manage Holidays
            </button>

            {/* Button to Generate Salary Slips */}
            <button
              onClick={handleSalaryGeneration}
              className="bg-blue-500 text-white text-lg py-4 px-8 rounded-lg shadow-xl hover:bg-blue-600 transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none"
            >
              Generate Salary Slips
            </button>

            {/* Button to Add New User */}
            <button
              onClick={handleClickAddUser}
              className="bg-blue-500 text-white text-lg py-4 px-8 rounded-lg shadow-xl hover:bg-blue-600 transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none"
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
