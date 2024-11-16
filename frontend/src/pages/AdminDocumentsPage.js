import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Store the search query
  const [filteredDocuments, setFilteredDocuments] = useState([]); // Store filtered documents based on search

  useEffect(() => {
    const fetchDocuments = async () => {
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users/admin/all-documents/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDocuments(response.data.documents);
        setFilteredDocuments(response.data.documents); // Initially show all documents
      } catch (err) {
        setError("Failed to fetch documents. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Function to handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter documents based on the search query (matching user email)
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDocuments(documents); // Show all if search is empty
    } else {
      const filtered = documents.filter(
        (entry) =>
          entry.user.email.toLowerCase().includes(searchQuery.toLowerCase()) // Match by email
      );
      setFilteredDocuments(filtered);
    }
  }, [searchQuery, documents]);

  if (loading)
    return (
      <div>
        <Navbar />
        <br />
        <br />
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading files...</p>
          <div className="loader border-t-4 border-blue-500 w-10 h-10 rounded-full animate-spin mt-4 mx-auto"></div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-600 py-10">
        <span className="text-lg">{error}</span>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-semibold text-gray-800 mb-8 text-center">
          Admin Documents Overview
        </h1>

        {/* Search Input */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by user email..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filteredDocuments.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No documents found for the specified email.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredDocuments.map((entry) => (
              <div
                key={entry.user.file_id}
                className="bg-white shadow-lg rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {entry.user.first_name} {entry.user.last_name}
                    </h2>
                    <span className="text-gray-600 text-lg">
                      {entry.files.length}{" "}
                      {entry.files.length === 1 ? "file" : "files"}
                    </span>
                  </div>
                  <h3 className="text-gray-500 text-sm mb-3">
                    <em>({entry.user.email})</em>
                  </h3>
                  <div className="text-gray-500 mb-4">
                    Folder:{" "}
                    <span className="font-medium text-gray-700">
                      {entry.user.folder_name}
                    </span>
                  </div>
                  {/* Display files in grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {entry.files.map((file) => (
                      <div
                        key={file.file_id}
                        className="bg-gray-100 p-4 rounded-md shadow hover:bg-gray-200 transition duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          {/* File type icon (using emojis for now) */}
                          <span className="text-xl">
                            {file.file_type === "pdf" ? "📄" : "📁"}
                          </span>
                          <div>
                            <a
                              href={file.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              {file.file_name}
                            </a>
                            <p className="text-gray-500 text-xs">
                              ({file.file_type})
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentsPage;
