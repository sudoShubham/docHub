import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import Skeleton from "react-loading-skeleton";
import ApplyLeave from "./ApplyLeave";
import LeaveSummary from "./LeaveSummary";
import LeaveApproval from "./LeaveApproval";
import Navbar from "./Navbar";

const MyLeaves = () => {
  const [leaveDetails, setLeaveDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaveDetails();
  }, []);

  const fetchLeaveDetails = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/users/leave/details/`,

        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      setLeaveDetails(response.data);
    } catch (err) {
      console.error("Error fetching leave details:", err);
      setError("Failed to fetch leave details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton count={3} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-lg text-red-600">{error}</div>;
  }

  if (!leaveDetails) {
    return (
      <div className="text-center text-lg text-gray-600">
        No leave details available.
      </div>
    );
  }

  const {
    total_leaves,
    used_leaves,
    remaining_leaves,
    pending_leaves,
    leave_history,
  } = leaveDetails;

  return (
    <div>
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-black p-4 border-b-4 border-sky-300 inline-block mb-6">
          My Leaves
        </h2>

        {/* Leave Summary Section */}
        <LeaveSummary
          totalLeaves={total_leaves}
          usedLeaves={used_leaves}
          remainingLeaves={remaining_leaves}
          pendingLeaves={pending_leaves}
          leaveHistory={leave_history}
        />

        {/* Apply Leave Section */}
        <ApplyLeave onLeaveApplied={fetchLeaveDetails} />

        <LeaveApproval />
      </div>
    </div>
  );
};

export default MyLeaves;
