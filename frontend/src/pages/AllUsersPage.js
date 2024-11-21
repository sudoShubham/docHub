import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";
import {
  FaEnvelope,
  FaUserAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const AllUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users/admin/user-details/`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );

        if (response.data && Array.isArray(response.data.user_details)) {
          setUsers(response.data.user_details);
          setFilteredUsers(response.data.user_details);
        } else {
          setError("No user data available.");
        }
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch user details.");
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = users.filter((userDetail) =>
      userDetail.user.email.toLowerCase().includes(query)
    );

    setFilteredUsers(filtered);
  };

  const toggleUserDetails = (username) => {
    setExpandedUser(expandedUser === username ? null : username);
  };

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <Navbar />

      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6">All Users and Details</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by email..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
          />
        </div>

        {/* User Accordion */}
        <div className="space-y-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((userDetail) => (
              <div
                key={userDetail.user.username}
                className="border p-4 rounded-lg shadow bg-white hover:shadow-md transition duration-300"
              >
                {/* Header */}
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleUserDetails(userDetail.user.username)}
                >
                  <div className="flex items-center space-x-4">
                    <FaUserAlt size={30} className="text-blue-500" />
                    <div>
                      <h2 className="text-lg font-semibold truncate">
                        {userDetail.user.first_name} {userDetail.user.last_name}
                      </h2>
                      <p className="text-gray-600 truncate">
                        <FaEnvelope className="inline mr-2" />
                        {userDetail.user.email}
                      </p>
                    </div>
                  </div>
                  <button>
                    {expandedUser === userDetail.user.username ? (
                      <FaChevronUp size={20} />
                    ) : (
                      <FaChevronDown size={20} />
                    )}
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedUser === userDetail.user.username && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">User Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p>
                          <strong>Username:</strong> {userDetail.user.username}
                        </p>
                        <p>
                          <strong>First Name:</strong>{" "}
                          {userDetail.user.first_name}
                        </p>
                        <p>
                          <strong>Last Name:</strong>{" "}
                          {userDetail.user.last_name}
                        </p>
                        <p>
                          <strong>Staff Status:</strong>{" "}
                          {userDetail.user.is_staff ? "Yes" : "No"}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Email:</strong> {userDetail.user.email}
                        </p>
                        <p>
                          <strong>Superuser:</strong>{" "}
                          {userDetail.user.is_superuser ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <h3 className="text-lg font-semibold mt-4">
                      Additional Details
                    </h3>
                    <div className="text-sm text-gray-700 space-y-2">
                      {Object.entries(userDetail.details).map(
                        ([key, value]) => (
                          <p key={key}>
                            <strong>
                              {key.replace(/_/g, " ").toUpperCase()}:
                            </strong>{" "}
                            {value || "Not Provided"}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllUsersPage;
