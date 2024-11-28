import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const LeaveApproval = () => {
  const [leaveReports, setLeaveReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveReports = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users/user-reports/`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );
        setLeaveReports(response.data);
      } catch (err) {
        console.error("Error fetching leave reports:", err);
        setError("Failed to fetch leave reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveReports();
  }, []);

  const handleApproveLeave = async (leaveId, managerComment) => {
    try {
      const payload = { leave_id: leaveId, manager_comment: managerComment };
      await axios.post(`${API_BASE_URL}/api/users/approve-leave/`, payload, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });
      alert("Leave approved successfully!");
    } catch (err) {
      console.error("Error approving leave:", err);
      alert("Failed to approve leave. Please try again.");
    }
  };

  const handleRejectLeave = async (leaveId, managerComment) => {
    try {
      const payload = { leave_id: leaveId, manager_comment: managerComment };
      await axios.post(`${API_BASE_URL}/api/users/leave/reject/`, payload, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });
      alert("Leave rejected successfully!");
    } catch (err) {
      console.error("Error rejecting leave:", err);
      alert("Failed to reject leave. Please try again.");
    }
  };

  const toggleExpand = (leaveId) => {
    setLeaveReports((prevReports) =>
      prevReports.map((report) => ({
        ...report,
        leave_requests: report.leave_requests.map((leave) => ({
          ...leave,
          isExpanded:
            leave.leave_id === leaveId ? !leave.isExpanded : leave.isExpanded,
        })),
      }))
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold text-black p-4 border-b-4 border-sky-300 inline-block mb-6">
        Leave Approval
      </h2>

      {leaveReports
        .filter((employee) =>
          employee.leave_requests.some((leave) => leave.status === "Pending")
        ) // Filter employees with pending leave requests
        .map((employee) => (
          <div
            key={employee.employee_id}
            className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg mb-6"
          >
            <div className="text-xl font-semibold text-gray-800 mb-4">
              {employee.first_name} {employee.last_name} ({employee.employee_id}
              )
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Leave Balance
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="font-medium text-gray-600">Total Leaves</div>
                  <div className="text-gray-800">
                    {employee.leave_balance.total_leaves}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-600">Used Leaves</div>
                  <div className="text-gray-800">
                    {employee.leave_balance.used_leaves}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-600">
                    Remaining Leaves
                  </div>
                  <div className="text-gray-800">
                    {employee.leave_balance.remaining_leaves}
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Leave Requests
            </h3>
            {employee.leave_requests
              .filter((leave) => leave.status === "Pending") // Filter only pending leave requests
              .map((leave) => (
                <div
                  key={leave.leave_id}
                  className="mb-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between">
                    <div className="font-semibold text-gray-700">
                      {leave.reason}
                    </div>
                    <div
                      className={`text-sm ${
                        leave.status === "Approved"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {leave.status}
                    </div>
                  </div>

                  {/* Toggle Expand Button */}
                  <button
                    onClick={() => toggleExpand(leave.leave_id)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-sky-600 bg-transparent border border-sky-600 rounded-md shadow-sm hover:bg-sky-50 focus:outline-none transition duration-300 ease-in-out"
                  >
                    <span>{leave.isExpanded ? "Collapse" : "Expand"}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 ml-2 transform transition-transform duration-200 ${
                        leave.isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {leave.isExpanded && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-500">
                        <strong>Start Date:</strong> {leave.start_date}
                      </div>
                      <div className="text-sm text-gray-500">
                        <strong>End Date:</strong> {leave.end_date}
                      </div>
                      <div className="text-sm text-gray-500">
                        <strong>Applied On:</strong> {leave.applied_on}
                      </div>

                      {leave.status === "Pending" && (
                        <div className="mt-4">
                          <textarea
                            placeholder="Manager's comment"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            rows="3"
                            id={`manager-comment-${leave.leave_id}`}
                          />
                          <div className="mt-2 flex space-x-2">
                            <button
                              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
                              onClick={() =>
                                handleApproveLeave(
                                  leave.leave_id,
                                  document.getElementById(
                                    `manager-comment-${leave.leave_id}`
                                  ).value
                                )
                              }
                            >
                              Approve Leave
                            </button>

                            <button
                              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
                              onClick={() =>
                                handleRejectLeave(
                                  leave.leave_id,
                                  document.getElementById(
                                    `manager-comment-${leave.leave_id}`
                                  ).value
                                )
                              }
                            >
                              Reject Leave
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ))}
    </div>
  );
};

export default LeaveApproval;
