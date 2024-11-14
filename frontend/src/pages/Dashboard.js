import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Adjust path as necessary
import axios from "axios";

const Dashboard = () => {
  const [files, setFiles] = useState({
    aadharCard: null,
    panCard: null,
    passport: null,
    driverLicense: null,
  });

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
        name: `${user.first_name}`,
        email: user.email,
      });
    }
  }, []);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    setFiles((prevFiles) => {
      const updatedFiles = { ...prevFiles, [type]: file };
      console.log("Updated files:", updatedFiles); // Log the updated files after each change
      return updatedFiles;
    });
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    let isAnyFileSelected = false;

    Object.keys(files).forEach((key) => {
      if (files[key]) {
        formData.append(key, files[key]);
        isAnyFileSelected = true;
      }
    });

    // Log the file names of the selected files
    if (isAnyFileSelected) {
      const fileNames = Object.keys(files)
        .filter((key) => files[key]) // Filter out empty files
        .map((key) => files[key].name); // Get the file names

      console.log("Selected file names:", fileNames); // Log the file names

      try {
        const response = await axios.post("YOUR_BACKEND_UPLOAD_URL", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Documents uploaded successfully!");
      } catch (error) {
        alert("Error uploading documents. Please try again.");
      }
    } else {
      alert("Please select at least one document to upload.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar /> {/* Use Navbar Component */}
      <div className="pt-20 px-6 sm:px-12 lg:px-32">
        <div className="bg-white p-10 rounded-2xl shadow-xl mx-auto max-w-3xl">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
            Welcome {userDetails.name}, Upload Your Documents
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Please upload your important documents to complete your profile.
          </p>

          <form onSubmit={handleFileUpload} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="aadharCard"
                  className="block text-sm font-medium text-gray-700"
                >
                  Aadhar Card
                </label>
                <input
                  type="file"
                  id="aadharCard"
                  onChange={(e) => handleFileChange(e, "aadharCard")}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="panCard"
                  className="block text-sm font-medium text-gray-700"
                >
                  PAN Card
                </label>
                <input
                  type="file"
                  id="panCard"
                  onChange={(e) => handleFileChange(e, "panCard")}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="passport"
                  className="block text-sm font-medium text-gray-700"
                >
                  Passport
                </label>
                <input
                  type="file"
                  id="passport"
                  onChange={(e) => handleFileChange(e, "passport")}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="driverLicense"
                  className="block text-sm font-medium text-gray-700"
                >
                  Driver License
                </label>
                <input
                  type="file"
                  id="driverLicense"
                  onChange={(e) => handleFileChange(e, "driverLicense")}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Upload Documents
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
