import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { FaDownload, FaFileAlt, FaUpload } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config";

const Agreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [userDetails, setUserDetails] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  // Fetch user details from session storage
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

  // Fetch the agreements from the API
  const fetchAgreements = async () => {
    setLoading(true);
    try {
      const authToken = sessionStorage.getItem("authToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/users/folder-documents/`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setAgreements(response.data.documents);
    } catch (error) {
      console.error("Error fetching agreements:", error);
      alert("Failed to fetch agreements. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload with renaming
  const handleFileUpload = async (e, agreement) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if userDetails or agreement information is missing
    if (!userDetails.name || !agreement.file_name) {
      alert("Error: Missing user or agreement information for file renaming.");
      return;
    }

    // Sanitize file name by removing the extension and appending the user's name
    const sanitizedFileName = agreement.file_name.split(".")[0]; // Get the name without extension
    const fileExtension = file.name.substring(file.name.lastIndexOf("."));
    const renamedFileName = `${userDetails.name}_${sanitizedFileName}${fileExtension}`; // New file name

    // Create a new File object with the renamed file name
    const renamedFile = new File([file], renamedFileName, { type: file.type });

    const formData = new FormData();
    formData.append("file", renamedFile);

    try {
      setLoading(true);
      const authToken = sessionStorage.getItem("authToken");
      await axios.post(
        `${API_BASE_URL}/api/users/upload-documents/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload the file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch agreements when the component is mounted
  useEffect(() => {
    fetchAgreements();
  }, []);

  return (
    <div className="min-h-screen bg-white-100">
      <Navbar />
      <div className="pt-20 px-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full sm:w-10/12 lg:w-3/4 mx-auto">
          <h2 className="text-4xl font-semibold text-center text-gray-800 mb-8">
            {userDetails.name}'s Agreements
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Here are the agreements available for download and re-upload after
            signing.
          </p>

          {loading ? (
            <div className="flex justify-center items-center my-8">
              <div className="loader border-t-4 border-blue-500 w-10 h-10 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {agreements.length > 0 ? (
                agreements.map((agreement) => (
                  <div
                    key={agreement.file_id}
                    className="bg-gray-50 rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-medium text-gray-700">
                          {agreement.file_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {agreement.file_type.split("/")[1].toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <a
                          href={agreement.file_url}
                          className="text-blue-500 hover:text-blue-700 text-xl"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaFileAlt />
                        </a>
                      </div>
                    </div>
                    <div className="mt-4">
                      <a
                        href={agreement.file_url}
                        className="text-sm text-blue-500 font-semibold hover:text-blue-700"
                        download
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <FaDownload />
                          <span>Download</span>
                        </div>
                      </a>
                    </div>
                    <div className="mt-4">
                      <label className="text-sm text-blue-500 font-semibold cursor-pointer hover:text-blue-700">
                        <input
                          type="file"
                          className="hidden"
                          accept="application/pdf"
                          onChange={
                            (e) => handleFileUpload(e, agreement) // Pass full agreement object
                          }
                        />
                        <div className="flex items-center justify-center space-x-2">
                          <FaUpload />
                          <span>Re-upload</span>
                        </div>
                      </label>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  No agreements available for download.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Agreements;
