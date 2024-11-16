import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const Dashboard = () => {
  const [files, setFiles] = useState({
    aadharCard: [],
    panCard: [],
    passport: [],
    driverLicense: [],
  });
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: "", email: "" });
  const navigate = useNavigate();

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
    const selectedFiles = Array.from(e.target.files); // Convert FileList to Array
    setFiles((prevFiles) => ({
      ...prevFiles,
      [type]: [...prevFiles[type], ...selectedFiles],
    }));
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (Object.values(files).every((fileArray) => fileArray.length === 0)) {
      alert("Please select at least one document to upload.");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    // Append all selected files to the formData with unique keys
    Object.keys(files).forEach((key) => {
      files[key].forEach((file) => formData.append(key, file)); // Use document type as key
    });

    // Append user details for form submission
    formData.append("name", userDetails.name);
    formData.append("email", userDetails.email);

    try {
      const authToken = sessionStorage.getItem("authToken");
      const response = await axios.post(
        `${API_BASE_URL}/api/users/upload-documents/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // After successful upload, navigate to the documents page
      setLoading(false);
      navigate("/my-documents");
    } catch (error) {
      console.error("Error uploading documents:", error);
      alert("Error uploading documents. Please try again.");
      setLoading(false);
    }
  };

  const handleRemoveFile = (fileType, fileName) => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fileType]: prevFiles[fileType].filter((file) => file.name !== fileName),
    }));
  };

  return (
    <div className="min-h-screen bg-blue-10">
      <Navbar />
      <div className="container mx-auto pt-20 px-6 sm:px-12 lg:px-32">
        <div className="bg-white p-10 rounded-2xl max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-4">
            Welcome {userDetails.name}, Upload Your Documents
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Please upload your important documents to complete your profile.
          </p>

          <form onSubmit={handleFileUpload} className="space-y-6">
            {loading ? (
              <div className="text-center">
                <p className="text-lg text-gray-600">Uploading your files...</p>
                <div className="loader border-t-4 border-blue-500 w-10 h-10 rounded-full animate-spin mt-4 mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {["aadharCard", "panCard", "passport", "driverLicense"].map(
                  (docType) => (
                    <div key={docType} className="space-y-2">
                      <label
                        htmlFor={docType}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {docType
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </label>
                      <input
                        type="file"
                        id={docType}
                        onChange={(e) => handleFileChange(e, docType)}
                        className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        multiple // Allow multiple file selection
                      />
                      {files[docType] && files[docType].length > 0 && (
                        <div className="mt-2 space-y-2">
                          {files[docType].map((file) => (
                            <div
                              key={file.name}
                              className="flex justify-between items-center"
                            >
                              <span className="text-gray-600">{file.name}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveFile(docType, file.name)
                                }
                                className="text-red-600 hover:text-red-800"
                              >
                                <XCircleIcon className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-sky-500 text-white text-lg font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Documents"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
