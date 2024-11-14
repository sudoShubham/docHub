import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Adjust path if necessary
import { FaUpload, FaFileAlt } from "react-icons/fa"; // Icon library for buttons

const MyDocuments = () => {
  // Dummy data for uploaded files (replace with actual data from backend)
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Aadhar Card",
      type: "PDF",
      uploadedOn: "2024-11-13",
      fileUrl: "#",
    },
    {
      id: 2,
      name: "PAN Card",
      type: "JPG",
      uploadedOn: "2024-11-10",
      fileUrl: "#",
    },
    {
      id: 3,
      name: "Passport",
      type: "PDF",
      uploadedOn: "2024-11-05",
      fileUrl: "#",
    },
  ]);

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

  const handleFileChange = (e, docId) => {
    const updatedDocs = documents.map((doc) => {
      if (doc.id === docId) {
        // Update the document's file information here
        const newFile = e.target.files[0];
        return {
          ...doc,
          name: newFile.name,
          type: newFile.type,
          fileUrl: URL.createObjectURL(newFile), // For demo purpose, this generates a local URL
        };
      }
      return doc;
    });
    setDocuments(updatedDocs);
  };

  // Use this effect to fetch the actual data from the backend later
  useEffect(() => {
    // Example:
    // axios.get("/api/documents").then(response => setDocuments(response.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar /> {/* Use Navbar component */}
      <div className="pt-20 px-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full sm:w-10/12 lg:w-3/4 mx-auto">
          <h2 className="text-4xl font-semibold text-center text-gray-800 mb-8">
            {userDetails.name}'s Documents
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Here are the documents you've uploaded. You can re-upload any
            document if needed.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-gray-50 rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105 hover:shadow-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-medium text-gray-700">
                        {doc.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {doc.type} | Uploaded on: {doc.uploadedOn}
                      </p>
                    </div>
                    <div>
                      {/* View Button */}
                      <a
                        href={doc.fileUrl}
                        className="text-blue-500 hover:text-blue-700 text-xl"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaFileAlt />
                      </a>
                    </div>
                  </div>

                  {/* Re-upload Button */}
                  <div className="mt-4">
                    <label className="text-sm text-blue-500 font-semibold cursor-pointer hover:text-blue-700">
                      <input
                        type="file"
                        className="hidden"
                        accept="application/pdf,image/*"
                        onChange={(e) => handleFileChange(e, doc.id)} // Handle file change
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
                You haven't uploaded any documents yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDocuments;
