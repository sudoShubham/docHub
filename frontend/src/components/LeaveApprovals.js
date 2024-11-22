// src/components/LeaveApprovals.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const LeaveApprovals = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/leave-requests/`, // Change this to your actual API endpoint
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );
        setLeaveRequests(response.data);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };
    fetchLeaveRequests();
  }, []);

  const approveLeave = async (id) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/leave-requests/${id}/approve/`, // Adjust this API endpoint if necessary
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      setLeaveRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id ? { ...request, status: "Approved" } : request
        )
      );
    } catch (error) {
      console.error("Error approving leave:", error);
    }
  };

  const rejectLeave = async (id) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/leave-requests/${id}/reject/`, // Adjust this API endpoint if necessary
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      setLeaveRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id ? { ...request, status: "Rejected" } : request
        )
      );
    } catch (error) {
      console.error("Error rejecting leave:", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-black p-4 border-b-4 border-sky-300 inline-block mb-6">
        Leave Approvals
      </h2>
      <div className="space-y-6">
        {leaveRequests.length === 0 ? (
          <p>No leave requests pending approval.</p>
        ) : (
          leaveRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg mb-4 transition-all duration-300 hover:shadow-xl hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold text-gray-800">
                    {request.employeeName}
                  </div>
                  <div className="text-sm text-gray-600">
                    Requested leave from {request.startDate} to{" "}
                    {request.endDate}
                  </div>
                  <div className="text-xs text-blue-500">
                    {request.employeeEmail}
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => approveLeave(request.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectLeave(request.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <span
                  className={`font-semibold ${
                    request.status === "Approved"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Status: {request.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeaveApprovals;
