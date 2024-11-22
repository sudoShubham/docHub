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
  const [editingUser, setEditingUser] = useState(null);
  const [updatedUserDetails, setUpdatedUserDetails] = useState({});
  const [originalUserDetails, setOriginalUserDetails] = useState({}); // To store the original details

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
    setExpandedUser(expandedUser === username ? null : username);
  };

  const handleEdit = (user) => {
    setEditingUser(user.user.username);
    setUpdatedUserDetails(user);
    setOriginalUserDetails(user); // Store the original details for comparison
    setExpandedUser(user.user.username);
  };

  // const handleSave = async (user) => {
  //   try {
  //     // Create a payload with only changed fields
  //     const updatedFields = {};
  //     for (const key in updatedUserDetails.details) {
  //       if (
  //         updatedUserDetails.details[key] !== originalUserDetails.details[key]
  //       ) {
  //         updatedFields[key] = updatedUserDetails.details[key];
  //       }
  //     }

  //     if (Object.keys(updatedFields).length === 0) {
  //       alert("No changes detected.");
  //       return;
  //     }

  //     const response = await axios.put(
  //       `${API_BASE_URL}/api/users/admin/user-update/`,
  //       { details: updatedFields }, // Send only updated fields
  //       {
  //         headers: {
  //           Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
  //         },
  //       }
  //     );

  //     if (response.status === 200) {
  //       alert("User details updated successfully.");
  //       setEditingUser(null);
  //       fetchUserDetails();
  //     } else {
  //       alert("Failed to update user details.");
  //     }
  //   } catch (error) {
  //     alert("Error updating user details.");
  //   }
  // };

  const handleSave = async (user) => {
    try {
      // Create a payload with the email and only changed fields
      const updatedFields = {};
      for (const key in updatedUserDetails.details) {
        if (
          updatedUserDetails.details[key] !== originalUserDetails.details[key]
        ) {
          updatedFields[key] = updatedUserDetails.details[key];
        }
      }

      if (Object.keys(updatedFields).length === 0) {
        alert("No changes detected.");
        return;
      }

      const payload = {
        email: updatedUserDetails.user.email, // Include the email
        details: updatedFields, // Send only updated fields
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/users/admin/user-update/`,
        payload, // Send email and updated fields
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.status === 200) {
        alert("User details updated successfully.");
        setEditingUser(null);
        fetchUserDetails();
      } else {
        alert("Failed to update user details.");
      }
    } catch (error) {
      alert("Error updating user details.");
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setUpdatedUserDetails({});
    setOriginalUserDetails({}); // Reset original details on cancel
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

  const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const currentUserEmail = userDetails.email;

  if (loading) {
    return (
      <div className="text-center p-10">
        <div className="loader">Loading...</div>{" "}
        {/* You can add a spinner here */}
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  return (
    <div>
      <Navbar />

      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-center mb-8">
          All Users and Details
        </h1>

        {/* Search Bar */}
        <div className="mb-6 max-w-md mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by email..."
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* User List */}
        <div className="space-y-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((userDetail) => (
              <div
                key={userDetail.user.username}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200"
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
                          [
                            "First Name",
                            userDetail.user.first_name,
                            false,
                            "text",
                            "first_name",
                          ],
                          [
                            "Last Name",
                            userDetail.user.last_name,
                            false,
                            "text",
                            "last_name",
                          ],
                          [
                            "Username",
                            userDetail.user.username,
                            true,
                            "text",
                            "username",
                          ],
                          [
                            "Staff Status",
                            userDetail.user.is_staff ? "Yes" : "No",
                            true,
                            "text",
                            "is_staff",
                          ],
                          [
                            "Superuser",
                            userDetail.user.is_superuser ? "Yes" : "No",
                            true,
                            "text",
                            "is_superuser",
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
                            false,
                            "email",
                            "personal_email",
                          ],
                          [
                            "Blood Group",
                            userDetail.details.blood_group || "N/A",
                            false, // This will make it editable and show a dropdown
                            "dropdown", // Mark as dropdown
                            "blood_group",
                          ],
                          [
                            "Current Address",
                            userDetail.details.current_address || "N/A",
                            false,
                            "text",
                            "current_address",
                          ],
                          [
                            "Permanent Address",
                            userDetail.details.permanent_address || "N/A",
                            false,
                            "text",
                            "permanent_address",
                          ],
                          [
                            "Position",
                            userDetail.details.position || "N/A",
                            false,
                            "text",
                            "position",
                          ],
                          [
                            "Reporting Manager",
                            userDetail.details.reporting_manager || "N/A",
                            false,
                            "dropdown",
                            "reporting_manager",
                          ],
                          [
                            "Job Profile",
                            userDetail.details.job_profile || "N/A",
                            false,
                            "text",
                            "job_profile",
                          ],
                          [
                            "Employee Type",
                            userDetail.details.employee_type || "N/A",
                            false,
                            "text",
                            "employee_type",
                          ],
                          [
                            "Time Type",
                            userDetail.details.time_type || "N/A",
                            false,
                            "text",
                            "time_type",
                          ],
                          [
                            "Location",
                            userDetail.details.location || "N/A",
                            false,
                            "text",
                            "location",
                          ],
                          // Hire Date - Date picker
                          [
                            "Hire Date",
                            userDetail.details.hire_date || "N/A",
                            false, // Editable with date picker
                            "date", // Mark as date picker
                            "hire_date",
                          ],
                          [
                            "Length of Service",
                            userDetail.details.length_of_service || "N/A",
                            true,
                            "text",
                            "length_of_service",
                          ],
                          // Date of Birth - Date picker
                          [
                            "Date of Birth",
                            userDetail.details.date_of_birth || "N/A",
                            false, // Editable with date picker
                            "date", // Mark as date picker
                            "date_of_birth",
                          ],
                          [
                            "Mobile Number",
                            userDetail.details.mobile_number || "N/A",
                            false,
                            "number",
                            "mobile_number",
                          ],
                          [
                            "Emergency Contact Person",
                            userDetail.details.emergency_contact_person ||
                              "N/A",
                            false,
                            "text",
                            "emergency_contact_person",
                          ],
                          [
                            "Emergency Contact Number",
                            userDetail.details.emergency_contact_number ||
                              "N/A",
                            false,
                            "number",
                            "emergency_contact_number",
                          ],
                          [
                            "Gender",
                            userDetail.details.gender || "N/A",
                            false,
                            "dropdown",
                            "gender",
                          ],
                          [
                            "Country of Birth",
                            userDetail.details.country_of_birth || "N/A",
                            false,
                            "text",
                            "gender",
                          ],
                          [
                            "Marital Status",
                            userDetail.details.marital_status || "N/A",
                            false, // Editable with dropdown
                            "dropdown", // Mark as dropdown
                            "marital_status",
                          ],
                          [
                            "Bank Account Name",
                            userDetail.details.bank_account_name || "N/A",
                            false,
                            "text",
                            "bank_account_name",
                          ],
                          [
                            "Bank Account Number",
                            userDetail.details.bank_account_number || "N/A",
                            false,
                            "text",
                            "bank_account_number",
                          ],
                          [
                            "Bank Account IFSC Code",
                            userDetail.details.bank_account_ifsc_code || "N/A",
                            false,
                            "text",
                            "bank_account_ifsc_code",
                          ],
                          [
                            "PF Account Number",
                            userDetail.details.pf_uan_no || "N/A",
                            false,
                            "text",
                            "pf_account_number",
                          ],
                        ].map(
                          ([
                            field,
                            value,
                            isNonEditable,
                            fieldType,
                            field_key,
                          ]) => (
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
                                        updatedUserDetails.details[field_key] ||
                                        value
                                      }
                                      onChange={(e) =>
                                        handleChange(e, field_key)
                                      }
                                      className="border px-3 py-2 rounded-md shadow-sm w-full"
                                    />
                                  ) : fieldType === "dropdown" ? ( // Dropdown for Reporting Manager, Gender, Marital Status, and Blood Group
                                    field === "Reporting Manager" ? (
                                      <select
                                        value={
                                          updatedUserDetails.details
                                            .reporting_manager || value
                                        }
                                        onChange={handleReportingManagerChange}
                                        className="border px-3 py-2 rounded-md shadow-sm w-full"
                                      >
                                        {/* <option value="">Select Manager</option> */}
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
                                        className="border px-3 py-2 rounded-md shadow-sm w-full"
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
                                        className="border px-3 py-2 rounded-md shadow-sm w-full"
                                      >
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Divorced">
                                          Divorced
                                        </option>
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
                                        className="border px-3 py-2 rounded-md shadow-sm w-full"
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
                                        updatedUserDetails.details[field_key] ||
                                        value
                                      }
                                      onChange={(e) =>
                                        handleChange(e, field_key)
                                      }
                                      className="border px-3 py-2 rounded-md shadow-sm w-full"
                                    />
                                  )
                                ) : (
                                  value
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>

                    {editingUser === userDetail.user.username && (
                      <div className="mt-6 flex justify-end space-x-4">
                        <button
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          onClick={() => handleSave(userDetail)}
                        >
                          Save
                        </button>
                        <button
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          onClick={handleCancelEdit}
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
            <div className="text-center text-gray-500">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllUsersPage;
