import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ChangePassword from "../components/ChangePassword";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";

const EditableFields = [
  "personal_email",
  "blood_group",
  "current_address",
  "permanent_address",
  "mobile_number",
  "emergency_contact_person",
  "emergency_contact_number",
  "gender",
  "country_of_birth",
  "marital_status",
  "bank_account_name",
  "bank_account_number",
  "bank_account_ifsc_code",
  "pf_uan_no",
  "pf_no",
  "pan_no",
  "aadhar_number",
  "date_of_birth",
];

const MyProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [groupedDetails, setGroupedDetails] = useState({});
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("Personal");
  const [isEditing, setIsEditing] = useState(false); // Track editing state
  const navigate = useNavigate();

  const genderOptions = ["Male", "Female", "Other"]; // Gender dropdown options
  const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed"]; // Marital status dropdown options
  const bloodGroupOptions = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"];

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        const response = await fetch(
          `${API_BASE_URL}/api/users/user-profile/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        }

        const data = await response.json();
        setUserDetails(data.user_profile);

        // Set groupedDetails state here
        const grouped = groupDetails(data.user_profile);
        setGroupedDetails(grouped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const toggleChangePasswordModal = () => {
    setIsChangePasswordOpen(!isChangePasswordOpen);
  };

  const groupDetails = (userDetails) => {
    if (!userDetails) return {};

    return {
      Personal: {
        first_name: userDetails.first_name,
        last_name: userDetails.last_name,
        email: userDetails.email,
        gender: userDetails.gender,
        personal_email: userDetails.personal_email,
        mobile_number: userDetails.mobile_number,
        date_of_birth: userDetails.date_of_birth,
        blood_group: userDetails.blood_group,
        current_address: userDetails.current_address,
        permanent_address: userDetails.permanent_address,
        country_of_birth: userDetails.country_of_birth,
        marital_status: userDetails.marital_status,
      },
      Bank: {
        bank_account_number: userDetails.bank_account_number,
        bank_account_ifsc_code: userDetails.bank_account_ifsc_code,
        bank_account_name: userDetails.bank_account_name,
        pf_uan_no: userDetails.pf_uan_no,
        pf_no: userDetails.pf_no,
        pan_no: userDetails.pan_no,
        aadhar_number: userDetails.aadhar_number,
      },
      Employment: {
        employee_id: userDetails.employee_id,
        department: userDetails.department,
        reporting_manager: userDetails.reporting_manager,
        position: userDetails.position,
        job_profile: userDetails.job_profile,
        designation: userDetails.designation,
        hire_date: userDetails.hire_date,
        length_of_service: userDetails.length_of_service,
        employee_type: userDetails.employee_type,
        time_type: userDetails.time_type,
        job_location: userDetails.location,
      },
      Emergency: {
        emergency_contact_person: userDetails.emergency_contact_person,
        emergency_contact_number: userDetails.emergency_contact_number,
      },
    };
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const handleInputChange = (e, key) => {
    setGroupedDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails };
      if (!updatedDetails[activeSection]) {
        updatedDetails[activeSection] = {}; // Initialize if undefined
      }
      updatedDetails[activeSection][key] = e.target.value;
      return updatedDetails;
    });
  };

  const handleSave = async () => {
    const token = sessionStorage.getItem("authToken");
    const updatedFields = {};

    if (!userDetails || !groupedDetails[activeSection]) {
      alert("User details not loaded correctly.");
      return;
    }

    // Iterate through the grouped details for the active section
    Object.entries(groupedDetails[activeSection]).forEach(
      ([key, updatedValue]) => {
        const originalValue = userDetails[key];

        // Compare original and updated values to identify changes
        if (String(originalValue || "") !== String(updatedValue || "")) {
          updatedFields[key] = updatedValue;
        }
      }
    );

    // Check if any fields were modified
    if (Object.keys(updatedFields).length === 0) {
      alert("No changes detected!");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/update-profile/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedFields), // Send only changed fields
        }
      );

      if (response.ok) {
        alert("Profile updated successfully!");
        setIsEditing(false);

        // Update userDetails with the new values after successful save
        setUserDetails((prevDetails) => ({
          ...prevDetails,
          ...updatedFields,
        }));
      } else {
        const errorData = await response.json();
        alert(`Failed to update profile: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin border-t-4 border-blue-600 rounded-full w-12 h-12"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500 text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 px-4 mt-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>

        <button
          onClick={toggleChangePasswordModal}
          className="py-2 px-4 bg-sky-400 text-black font-medium rounded-lg hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Change Password
        </button>
      </div>

      <div className="flex flex-col lg:flex-row pt-4">
        {/* Left Navigation */}
        <div className="lg:w-1/4 bg-white p-4 rounded-lg mb-4 lg:mb-0">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sections</h2>
          <ul className="space-y-2">
            {Object.keys(groupedDetails).map((section) => (
              <li
                key={section}
                className={`cursor-pointer text-md font-medium ${
                  activeSection === section
                    ? "bg-blue-100 text-blue-600 rounded-md p-2"
                    : "text-gray-700 hover:bg-gray-200 rounded-md p-2"
                }`}
                onClick={() => handleSectionClick(section)}
              >
                {section}
              </li>
            ))}
          </ul>
        </div>

        {/* Profile Details */}
        <div className="lg:w-3/4 bg-white shadow-md p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-sky-400 inline-block">
            {activeSection} Details
          </h2>

          {/* Collapsible Section */}
          {/* Collapsible Section */}
          <div className="space-y-4">
            {groupedDetails[activeSection] &&
              Object.entries(groupedDetails[activeSection]).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row items-start sm:items-center"
                  >
                    <label className="w-full sm:w-1/3 text-gray-700 font-medium capitalize mb-2 sm:mb-0">
                      {key.replaceAll("_", " ")}
                    </label>
                    <div className="w-full sm:w-2/3">
                      {isEditing && EditableFields.includes(key) ? (
                        key === "gender" ? (
                          <select
                            value={value}
                            onChange={(e) => handleInputChange(e, key)}
                            className="w-full text-gray-700 border rounded-lg p-2 outline-none ring-2 ring-sky-300"
                          >
                            <option value="">Select Gender</option>
                            {genderOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : key === "date_of_birth" ? (
                          <input
                            type="date"
                            value={value}
                            onChange={(e) => handleInputChange(e, key)}
                            className="w-full text-gray-700 border rounded-lg p-2 outline-none ring-2 ring-sky-300 bg-white"
                          />
                        ) : key === "marital_status" ? (
                          <select
                            value={value}
                            onChange={(e) => handleInputChange(e, key)}
                            className="w-full text-gray-700 border rounded-lg p-2 outline-none ring-2 ring-sky-300 bg-white"
                          >
                            <option value="">Select Marital Status</option>
                            {maritalStatusOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : key === "blood_group" ? (
                          <select
                            value={value}
                            onChange={(e) => handleInputChange(e, key)}
                            className="w-full text-gray-700 border rounded-lg p-2 outline-none ring-2 ring-sky-300 bg-white"
                          >
                            <option value="">Select Blood Group</option>
                            {bloodGroupOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleInputChange(e, key)}
                            className="w-full text-gray-700 border rounded-lg p-2 outline-none ring-2 ring-sky-300"
                          />
                        )
                      ) : (
                        <p className="text-gray-600">{value || "N/A"}</p>
                      )}
                    </div>
                  </div>
                )
              )}
          </div>

          {/* Save Changes */}
          {isEditing && (
            <div className="mt-6 sticky bottom-4 flex justify-end">
              <button
                onClick={handleSave}
                className="py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      <ChangePassword
        isOpen={isChangePasswordOpen}
        onClose={toggleChangePasswordModal}
      />
    </div>
  );
};

export default MyProfile;
