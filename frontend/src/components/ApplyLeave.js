import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, differenceInCalendarDays } from "date-fns";

const ApplyLeave = ({ onLeaveApplied }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");

  // Function to calculate the number of days between start and end dates
  useEffect(() => {
    if (startDate && endDate) {
      const days = differenceInCalendarDays(endDate, startDate) + 1; // +1 to include both start and end days
      setLeaveMessage(
        `You are applying leave from ${format(
          startDate,
          "yyyy-MM-dd"
        )} to ${format(endDate, "yyyy-MM-dd")} for ${days} day(s).`
      );
    } else {
      setLeaveMessage("");
    }
  }, [startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!startDate || !endDate || !reason) {
      setError("All fields are required.");
      return;
    }

    // Use date-fns to format dates in YYYY-MM-DD format
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");

    const payload = {
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      reason,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/users/leave/apply/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      setSuccess("Leave applied successfully!");
      onLeaveApplied(response.data); // Notify parent component
      setStartDate(null);
      setEndDate(null);
      setReason("");
      setLeaveMessage(""); // Clear message after successful submission
    } catch (err) {
      console.error("Error applying leave:", err);
      setError("Failed to apply leave. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Apply for Leave
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            dateFormat="yyyy-MM-dd"
            placeholderText="Select start date"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            dateFormat="yyyy-MM-dd"
            placeholderText="Select end date"
            minDate={startDate}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            rows={3}
          />
        </div>

        {/* Display leave message as a bordered alert */}
        {leaveMessage && (
          <div className="border border-blue-500 bg-blue-50 text-blue-700 text-sm rounded-md p-4">
            {leaveMessage}
          </div>
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <button
          type="submit"
          className={`inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all duration-200 focus:outline-none ${
            loading
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Applying..." : "Apply Leave"}
        </button>
      </form>
    </div>
  );
};

export default ApplyLeave;
