import { API_BASE_URL } from "../config";
import React, { useState } from "react";
import axios from "axios";

const LeaveSummary = ({
  totalLeaves,
  usedLeaves,
  remainingLeaves,
  pendingLeaves, // Use this prop directly
  leaveHistory,
}) => {
  const [showPendingLeaves, setShowPendingLeaves] = useState(false);
  const [showLeaveHistory, setShowLeaveHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCancelLeave = async (leaveId) => {
    try {
      setLoading(true);
      setError(null);

      // Make the API call to cancel the leave
      await axios.post(
        `${API_BASE_URL}/api/users/cancel-leave/${leaveId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      // On success, update the UI by removing the canceled leave from pendingLeaves
      alert("Leave cancelled successfully!");

      // Remove the canceled leave from the pendingLeaves array
      const updatedPendingLeaves = pendingLeaves.filter(
        (leave) => leave.leave_id !== leaveId
      );
      // You will need to pass the updatedPendingLeaves to the parent component
      // to update the state there (e.g., using a callback function passed via props)
    } catch (err) {
      setError("Failed to cancel leave. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Leave Summary
      </h2>

      {/* Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalLeaves}</div>
          <div className="text-sm text-gray-600">Total Leaves</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{usedLeaves}</div>
          <div className="text-sm text-gray-600">Used Leaves</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {remainingLeaves}
          </div>
          <div className="text-sm text-gray-600">Remaining Leaves</div>
        </div>
      </div>

      {/* Pending Leaves Section */}
      <div className="mb-6">
        <button
          onClick={() => setShowPendingLeaves(!showPendingLeaves)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            showPendingLeaves
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-blue-600 hover:bg-blue-200 hover:text-blue-800"
          }`}
        >
          {showPendingLeaves ? "Hide" : "Show"} Pending Leaves
        </button>
        {showPendingLeaves && (
          <div className="mt-4 space-y-4">
            {pendingLeaves.length > 0 ? (
              pendingLeaves.map((leave) => (
                <div
                  key={leave.leave_id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="text-lg font-semibold text-gray-700">
                    {leave.reason}
                  </div>
                  <div className="text-sm text-gray-500">
                    <strong>Start Date:</strong> {leave.start_date}
                  </div>
                  <div className="text-sm text-gray-500">
                    <strong>End Date:</strong> {leave.end_date}
                  </div>
                  <div className="text-sm text-gray-500">
                    <strong>Applied On:</strong> {leave.applied_on}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleCancelLeave(leave.leave_id)}
                      disabled={loading}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        loading
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {loading ? "Cancelling..." : "Cancel Leave"}
                    </button>
                    {error && (
                      <div className="mt-2 text-red-600 text-sm">{error}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No pending leaves.</div>
            )}
          </div>
        )}
      </div>

      {/* Leave History Section */}
      <div>
        <button
          onClick={() => setShowLeaveHistory(!showLeaveHistory)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            showLeaveHistory
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-blue-600 hover:bg-blue-200 hover:text-blue-800"
          }`}
        >
          {showLeaveHistory ? "Hide" : "Show"} Leave History
        </button>
        {showLeaveHistory && (
          <div className="mt-4 space-y-4">
            {leaveHistory.length > 0 ? (
              leaveHistory.map((leave, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="text-lg font-semibold text-gray-700">
                    {leave.reason || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">
                    <strong>Start Date:</strong> {leave.start_date}
                  </div>
                  <div className="text-sm text-gray-500">
                    <strong>End Date:</strong> {leave.end_date}
                  </div>
                  <div className="text-sm text-gray-500">
                    <strong>Status:</strong> {leave.status || "N/A"}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No leave history available.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveSummary;
