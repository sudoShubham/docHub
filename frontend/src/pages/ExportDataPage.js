import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";
import * as XLSX from "xlsx"; // Import xlsx library

const ExportDataPage = () => {
  const [loading, setLoading] = useState(false); // To manage loading state
  const [error, setError] = useState(null); // To store error messages
  const [success, setSuccess] = useState(false); // To handle success message

  const handleExport = () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    fetch(`${API_BASE_URL}/api/users/admin/user-details/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const userDetails = data.user_details.map((item) => ({
          email: item.user.email,
          first_name: item.user.first_name,
          last_name: item.user.last_name,
          username: item.user.username,
          is_staff: item.user.is_staff ? "Yes" : "No",
          is_superuser: item.user.is_superuser ? "Yes" : "No",
          employee_id: item.details.employee_id,
          personal_email: item.details.personal_email,
          blood_group: item.details.blood_group,
          current_address: item.details.current_address,
          permanent_address: item.details.permanent_address,
          position: item.details.position,
          job_profile: item.details.job_profile,
          employee_type: item.details.employee_type,
          time_type: item.details.time_type,
          location: item.details.location,
          hire_date: item.details.hire_date,
          length_of_service: item.details.length_of_service,
          date_of_birth: item.details.date_of_birth,
          mobile_number: item.details.mobile_number,
          emergency_contact_person: item.details.emergency_contact_person,
          emergency_contact_number: item.details.emergency_contact_number,
          gender: item.details.gender,
          country_of_birth: item.details.country_of_birth,
          marital_status: item.details.marital_status,
          bank_account_name: item.details.bank_account_name,
          bank_account_number: item.details.bank_account_number,
          bank_account_ifsc_code: item.details.bank_account_ifsc_code,
          pf_uan_no: item.details.pf_uan_no,
          pf_no: item.details.pf_no,
          pan_no: item.details.pan_no,
          aadhar_number: item.details.aadhar_number,
          reporting_manager: item.details.reporting_manager,
        }));

        // Create a new worksheet
        const ws = XLSX.utils.json_to_sheet(userDetails);
        // Create a new workbook
        const wb = XLSX.utils.book_new();
        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "User Details");

        // Get the current date in YYYY-MM-DD format
        const today = new Date();
        const dateString = today.toISOString().split("T")[0]; // Format as YYYY-MM-DD

        // Generate the file name with the date included
        const fileName = `user_details_${dateString}.xlsx`;

        // Generate Excel file and trigger download
        XLSX.writeFile(wb, fileName);

        setSuccess(true); // Set success state
      })
      .catch((error) => {
        setError("Error exporting data: " + error.message); // Set error message
      })
      .finally(() => {
        setLoading(false); // Reset loading state after operation
      });
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen  flex flex-col items-center py-8">
        <div className="bg-white  rounded-lg p-8 w-full max-w-lg mt-6">
          <h1 className="text-3xl font-semibold text-gray-800 text-center mb-6">
            Export Users Data
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Click the button below to export the user data in Excel format.
          </p>

          {/* Success Message */}
          {success && (
            <p className="text-green-600 text-center mb-4">
              Data exported successfully!
            </p>
          )}

          {/* Error Message */}
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          <button
            className={`${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600"
            } text-white text-lg py-3 px-8 rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none w-full`}
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? <span>Loading...</span> : <span>Export Data</span>}
          </button>

          {/* Loading spinner */}
          {loading && (
            <div className="mt-4 flex justify-center">
              <div className="animate-spin border-t-4 border-blue-500 border-solid w-8 h-8 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportDataPage;
