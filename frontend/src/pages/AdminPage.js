import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const AdminPage = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/admin-documents"); // Navigate to AdminDocumentsPage
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6 md:p-12">
        <div className="bg-white shadow-xl rounded-lg p-8 space-y-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Admin Dashboard
          </h1>
          <p className="text-center text-gray-600">
            Welcome to the Admin Dashboard. You can manage and view all user
            document files here.
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleClick}
              className="bg-blue-600 text-white text-lg py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transform transition-all duration-300 ease-in-out hover:scale-105"
            >
              View Users' Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
