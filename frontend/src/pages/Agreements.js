import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { FaDownload, FaFileAlt } from "react-icons/fa"; // For icons

const Agreements = () => {
  const [agreements, setAgreements] = useState([]);

  const [userDetails, setUserDetails] = useState({ name: "", email: "" });

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

  const [loading, setLoading] = useState(false); // Add loading state

  // Dummy data for agreements
  const dummyAgreements = [
    {
      id: 1,
      file_name: "Agreement 1",
      file_type: "PDF",
      file_url: "https://via.placeholder.com/150?text=Download+1", // Replace with dummy download URL
    },
    {
      id: 2,
      file_name: "Agreement 2",
      file_type: "PDF",
      file_url: "https://via.placeholder.com/150?text=Download+2", // Replace with dummy download URL
    },
    {
      id: 3,
      file_name: "Agreement 3",
      file_type: "PDF",
      file_url: "https://via.placeholder.com/150?text=Download+3", // Replace with dummy download URL
    },
  ];

  const fetchAgreements = () => {
    // Simulate fetching data with a delay
    setLoading(true);
    setTimeout(() => {
      setAgreements(dummyAgreements); // Set dummy data as fetched agreements
      setLoading(false);
    }, 1000); // Simulate a 1-second delay
  };

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
            Here are the agreements available for download. Click to download
            any document.
          </p>

          {loading ? ( // Display spinner if loading
            <div className="flex justify-center items-center my-8">
              <div className="loader border-t-4 border-blue-500 w-10 h-10 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {agreements.length > 0 ? (
                agreements.map((agreement) => (
                  <div
                    key={agreement.id}
                    className="bg-gray-50 rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-medium text-gray-700">
                          {agreement.file_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {agreement.file_type}
                        </p>
                      </div>
                      <div>
                        <a
                          href={agreement.file_url} // Assuming the URL is for downloading
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
                        href={agreement.file_url} // Direct download link
                        className="text-sm text-blue-500 font-semibold hover:text-blue-700"
                        download
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <FaDownload />
                          <span>Download</span>
                        </div>
                      </a>
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
