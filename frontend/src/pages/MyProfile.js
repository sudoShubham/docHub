import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import ChangePassword from "../components/ChangePassword";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("Personal");
  const navigate = useNavigate(); // Initialize useNavigate hook

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
            navigate("/login"); // Navigate to /login page
          }, 1500);
        }

        const data = await response.json();
        setUserDetails(data.user_profile);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const toggleChangePasswordModal = () => {
    setIsChangePasswordOpen(!isChangePasswordOpen);
  };

  const groupDetails = () => {
    if (!userDetails) return {};

    return {
      Personal: {
        name: `${userDetails.first_name} ${userDetails.last_name}`,
        email: userDetails.email,
        gender: userDetails.gender,
        personal_email: userDetails.personal_email,
        mobile: userDetails.mobile_number,
        address: userDetails.address,
        date_of_birth: userDetails.date_of_birth,
        blood_group: userDetails.blood_group,
        current_address: userDetails.current_address,
        permanent_address: userDetails.permanent_address,
        country_of_birth: userDetails.country_of_birth,
        marital_status: userDetails.marital_status,
      },
      Bank: {
        account_number: userDetails.bank_account_number,
        IFSC_code: userDetails.bank_account_ifsc_code,
        bank_name: userDetails.bank_account_name,
        PF_UAN_no: userDetails.pf_uan_no,
        PF_no: userDetails.pf_no,
        pan_card_number: userDetails.pan_no,
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
        emergency_contact_name: userDetails.emergency_contact_person,
        emergency_contact_number: userDetails.emergency_contact_number,
      },
    };
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
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

  const groupedDetails = groupDetails();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Change Password Button placed below Navbar */}
      <div className="mt-6 flex justify-end gap-4 px-4">
        <button
          onClick={() => console.log("OK")} // Wrap the log in a function
          className="py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Update Profile
        </button>

        <button
          onClick={toggleChangePasswordModal}
          className="py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Change Password
        </button>
      </div>

      <div className="flex pt-20 flex-col lg:flex-row">
        {/* Left Panel for navigation */}
        <div className="lg:w-1/4 bg-white p-4 rounded-lg mb-4 lg:mb-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Profile Sections
          </h2>
          <ul className="space-y-4">
            {Object.keys(groupedDetails).map((section) => (
              <li
                key={section}
                className={`cursor-pointer text-lg font-medium ${
                  activeSection === section ? "text-blue-600" : "text-gray-600"
                }`}
                onClick={() => handleSectionClick(section)}
              >
                {section}
              </li>
            ))}
          </ul>
        </div>

        {/* Main content */}
        <div className="lg:w-3/4 px-6 py-4">
          <section className="bg-white p-6 rounded-lg">
            <header className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">
                My Profile
              </h1>
              <p className="text-gray-500">Manage your profile details below</p>
            </header>

            <div>
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                {activeSection} Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(groupedDetails[activeSection]).map(
                  ([key, value]) => (
                    <div
                      className="p-4 bg-gray-100 rounded-md shadow-sm"
                      key={key}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 capitalize">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="text-gray-600">{value || "N/A"}</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/home"
                className="text-blue-500 hover:underline hover:text-blue-700 font-medium"
              >
                Back to Home
              </Link>
            </div>
          </section>
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
