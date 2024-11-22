// src/pages/MyOrganization.js
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Organization from "../components/Organization";
import LeaveApprovals from "../components/LeaveApprovals";

const MyOrganization = () => {
  const [activeSection, setActiveSection] = useState("organization"); // To track the active section

  return (
    <div>
      <Navbar />

      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <div className="bg-gray-100 p-4 space-y-4 w-full md:w-1/4">
          <button
            className={`w-full p-2 text-left rounded-md ${
              activeSection === "organization" ? "bg-sky-300" : "bg-white"
            }`}
            onClick={() => setActiveSection("organization")}
          >
            Organization
          </button>
          <button
            className={`w-full p-2 text-left rounded-md ${
              activeSection === "leaveApprovals" ? "bg-sky-300" : "bg-white"
            }`}
            onClick={() => setActiveSection("leaveApprovals")}
          >
            Leave Approvals
          </button>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4 p-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl m-5 font-semibold text-center mb-8 text-sky-600">
            My Organization
          </h1>

          {activeSection === "organization" && <Organization />}

          {activeSection === "leaveApprovals" && <LeaveApprovals />}
        </div>
      </div>
    </div>
  );
};

export default MyOrganization;
