import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";

const AllUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null); // To track the user being edited
  const [updatedUserDetails, setUpdatedUserDetails] = useState({}); // For storing updated data

  // Define fetchUserDetails function
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

  useEffect(() => {
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
    if (expandedUser === username) {
      setExpandedUser(null);
    } else {
      setExpandedUser(username);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.user.username);
    setUpdatedUserDetails(user); // Set the current data for editing
    setExpandedUser(user.user.username); // Automatically expand when editing
  };

  const handleSave = async (user) => {
    console.log(updatedUserDetails);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/users/admin/update/${user.user.username}/`,
        updatedUserDetails,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      if (response.status === 200) {
        alert("User details updated successfully.");
        setEditingUser(null); // Exit edit mode after successful save
        fetchUserDetails(); // Refresh user list to show updated data
      } else {
        alert("Failed to update user details.");
      }
    } catch (error) {
      alert("Error updating user details.");
    }
  };

  const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const currentUserEmail = userDetails.email;

  const handleCancelEdit = () => {
    setEditingUser(null); // Cancel editing and return to view mode
    setUpdatedUserDetails({}); // Reset updated user details to initial state
  };

  const handleChange = (e, field) => {
    setUpdatedUserDetails({
      ...updatedUserDetails,
      details: {
        ...updatedUserDetails.details,
        [field]: e.target.value,
      },
    });
  };

  const handleReportingManagerChange = (e) => {
    setUpdatedUserDetails({
      ...updatedUserDetails,
      details: {
        ...updatedUserDetails.details,
        reporting_manager: e.target.value,
      },
    });
  };

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  return (
    <div>
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

        {/* User List */}
        <div className="space-y-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((userDetail) => (
              <div
                key={userDetail.user.username}
                className="border p-4 rounded-lg shadow bg-white hover:shadow-md transition duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold truncate">
                      {userDetail.user.first_name} {userDetail.user.last_name}
                    </h2>
                    <p className="text-gray-600 truncate">
                      {userDetail.user.email}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() =>
                        toggleUserDetails(userDetail.user.username)
                      }
                    >
                      {expandedUser === userDetail.user.username
                        ? "Collapse"
                        : "Expand"}
                    </button>
                    {editingUser === userDetail.user.username ? (
                      <button
                        className="text-red-500 hover:underline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => handleEdit(userDetail)}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded User Details */}
                {expandedUser === userDetail.user.username && (
                  <div className="mt-4">
                    <table className="min-w-full border-collapse table-auto">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-6 py-3 text-left">Field</th>
                          <th className="px-6 py-3 text-left">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["First Name", userDetail.user.first_name],
                          ["Last Name", userDetail.user.last_name],
                          ["Username", userDetail.user.username],
                          [
                            "Staff Status",
                            userDetail.user.is_staff ? "Yes" : "No",
                          ],
                          [
                            "Superuser",
                            userDetail.user.is_superuser ? "Yes" : "No",
                          ],
                          // Make Employee ID non-editable
                          [
                            "Employee ID",
                            userDetail.details.employee_id || "N/A",
                            true, // Mark this as non-editable
                          ],
                          [
                            "Personal Email",
                            userDetail.details.personal_email || "N/A",
                          ],
                          [
                            "Blood Group",
                            userDetail.details.blood_group || "N/A",
                            false, // This will make it editable and show a dropdown
                            "dropdown", // Mark as dropdown
                          ],
                          [
                            "Current Address",
                            userDetail.details.current_address || "N/A",
                          ],
                          [
                            "Permanent Address",
                            userDetail.details.permanent_address || "N/A",
                          ],
                          ["Position", userDetail.details.position || "N/A"],
                          [
                            "Reporting Manager",
                            userDetail.details.reporting_manager || "N/A",
                            false,
                            "dropdown",
                          ],
                          [
                            "Job Profile",
                            userDetail.details.job_profile || "N/A",
                          ],
                          [
                            "Employee Type",
                            userDetail.details.employee_type || "N/A",
                          ],
                          ["Time Type", userDetail.details.time_type || "N/A"],
                          ["Location", userDetail.details.location || "N/A"],
                          // Hire Date - Date picker
                          [
                            "Hire Date",
                            userDetail.details.hire_date || "N/A",
                            false, // Editable with date picker
                            "date", // Mark as date picker
                          ],
                          [
                            "Length of Service",
                            userDetail.details.length_of_service || "N/A",
                            true,
                          ],
                          // Date of Birth - Date picker
                          [
                            "Date of Birth",
                            userDetail.details.date_of_birth || "N/A",
                            false, // Editable with date picker
                            "date", // Mark as date picker
                          ],
                          [
                            "Mobile Number",
                            userDetail.details.mobile_number || "N/A",
                          ],
                          [
                            "Emergency Contact Person",
                            userDetail.details.emergency_contact_person ||
                              "N/A",
                          ],
                          [
                            "Emergency Contact Number",
                            userDetail.details.emergency_contact_number ||
                              "N/A",
                          ],
                          [
                            "Gender",
                            userDetail.details.gender || "N/A",
                            false,
                            "dropdown",
                          ],
                          [
                            "Country of Birth",
                            userDetail.details.country_of_birth || "N/A",
                          ],
                          [
                            "Marital Status",
                            userDetail.details.marital_status || "N/A",
                            false, // Editable with dropdown
                            "dropdown", // Mark as dropdown
                          ],
                          [
                            "Bank Account Name",
                            userDetail.details.bank_account_name || "N/A",
                          ],
                          [
                            "Bank Account Number",
                            userDetail.details.bank_account_number || "N/A",
                          ],
                          [
                            "Bank Account IFSC Code",
                            userDetail.details.bank_account_ifsc_code || "N/A",
                          ],
                          [
                            "PF Account Number",
                            userDetail.details.pf_account_number || "N/A",
                          ],
                        ].map(([field, value, isNonEditable, fieldType]) => (
                          <tr key={field}>
                            <td className="px-6 py-3">{field}</td>
                            <td className="px-6 py-3">
                              {editingUser === userDetail.user.username ? (
                                isNonEditable ? (
                                  <span>{value}</span> // Display value as plain text if non-editable
                                ) : fieldType === "date" ? ( // Date picker for Hire Date and Date of Birth
                                  <input
                                    type="date"
                                    value={
                                      updatedUserDetails.details[field] || value
                                    }
                                    onChange={(e) => handleChange(e, field)}
                                    className="border p-2 rounded-lg"
                                  />
                                ) : fieldType === "dropdown" ? ( // Dropdown for Reporting Manager, Gender, Marital Status, and Blood Group
                                  field === "Reporting Manager" ? (
                                    <select
                                      value={
                                        updatedUserDetails.details
                                          .reporting_manager || value
                                      }
                                      onChange={handleReportingManagerChange}
                                      className="border p-2 rounded-lg"
                                    >
                                      <option value="">Select Manager</option>
                                      {users
                                        .filter(
                                          (u) =>
                                            u.user.email !== currentUserEmail
                                        ) // Filter out self
                                        .map((u) => (
                                          <option
                                            key={u.user.username}
                                            value={u.user.username}
                                          >
                                            {u.first_name} {u.last_name} (
                                            {u.user.email}){" "}
                                            {/* Add email here */}
                                          </option>
                                        ))}
                                    </select>
                                  ) : field === "Gender" ? (
                                    <select
                                      value={
                                        updatedUserDetails.details.gender ||
                                        value
                                      }
                                      onChange={(e) =>
                                        handleChange(e, "gender")
                                      }
                                      className="border p-2 rounded-lg"
                                    >
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  ) : field === "Marital Status" ? (
                                    <select
                                      value={
                                        updatedUserDetails.details
                                          .marital_status || value
                                      }
                                      onChange={(e) =>
                                        handleChange(e, "marital_status")
                                      }
                                      className="border p-2 rounded-lg"
                                    >
                                      <option value="Single">Single</option>
                                      <option value="Married">Married</option>
                                      <option value="Divorced">Divorced</option>
                                    </select>
                                  ) : (
                                    <select
                                      value={
                                        updatedUserDetails.details
                                          .blood_group || value
                                      }
                                      onChange={(e) =>
                                        handleChange(e, "blood_group")
                                      }
                                      className="border p-2 rounded-lg"
                                    >
                                      <option value="A+">A+</option>
                                      <option value="A-">A-</option>
                                      <option value="B+">B+</option>
                                      <option value="B-">B-</option>
                                      <option value="O+">O+</option>
                                      <option value="O-">O-</option>
                                      <option value="AB+">AB+</option>
                                      <option value="AB-">AB-</option>
                                    </select>
                                  )
                                ) : (
                                  <input
                                    type="text"
                                    value={
                                      updatedUserDetails.details[field] || value
                                    }
                                    onChange={(e) => handleChange(e, field)}
                                    className="border p-2 rounded-lg"
                                  />
                                )
                              ) : (
                                value
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {editingUser === userDetail.user.username && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleSave(userDetail)}
                          className="bg-blue-500 text-white py-2 px-6 rounded-lg mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 text-white py-2 px-6 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div>No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllUsersPage;
